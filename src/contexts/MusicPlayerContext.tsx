'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { toast } from 'react-hot-toast';
import artistService from '@/services/artistService';

interface Song {
    _id: string;
    title: string;
    audioUrl: string;
    coverImage?: string;
    duration: number;
    artists: any[];
    lyrics?: string;
    previewStart?: number;
}

interface MusicPlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playSong: (song: Song) => void;
    togglePlay: () => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    nextSong: () => void;
    previousSong: () => void;
    playList: (songs: Song[], startIndex?: number) => void;
    isShuffle: boolean;
    repeatMode: 'off' | 'all' | 'one';
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    queue: Song[];
    currentIndex: number;
    history: Song[];
    showAd: boolean;
    finishAd: () => void;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
    const context = useContext(MusicPlayerContext);
    if (!context) {
        throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
    }
    return context;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);

    const { user } = useAuth();
    const { showAlert } = useAlert();
    const userRef = useRef(user);
    const hasCountedRef = useRef(false);
    const currentSessionIdRef = useRef<string | null>(null);

    // Sync refs
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const currentSongRef = useRef<Song | null>(null);
    const queueRef = useRef<Song[]>([]);
    const currentIndexRef = useRef(-1);
    const isShuffleRef = useRef(false);
    const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');

    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [history, setHistory] = useState<Song[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('music_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    // Save history to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('music_history', JSON.stringify(history));
    }, [history]);

    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

    // Sync refs
    useEffect(() => {
        currentSongRef.current = currentSong;
    }, [currentSong]);

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        isShuffleRef.current = isShuffle;
    }, [isShuffle]);

    useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);

    const toggleShuffle = () => setIsShuffle(prev => !prev);

    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const getNextIndex = (currentIdx: number, qLength: number, shuffle: boolean, repeat: 'off' | 'all' | 'one') => {
        if (qLength === 0) return -1;
        if (repeat === 'one') return currentIdx; // Should not trigger on next button, only ended.
        // But helper function general purpose:
        if (shuffle) {
            // Simple random for now
            let nextIdx = Math.floor(Math.random() * qLength);
            // Try to avoid repeating same song if length > 1
            if (qLength > 1 && nextIdx === currentIdx) {
                nextIdx = (nextIdx + 1) % qLength;
            }
            return nextIdx;
        }
        // Normal
        if (currentIdx < qLength - 1) return currentIdx + 1;
        if (repeat === 'all') return 0;
        return -1;
    };


    // Trạng Thái Logic Quảng Cáo
    const [showAd, setShowAd] = useState(false);
    const pendingSongRequestRef = useRef<{ song: Song, index: number } | null>(null);

    // Hàm hỗ trợ phát nhạc mà không reset hàng chờ nếu là một phần của playlist
    const playSongInternal = async (song: Song, index: number) => {
        if (!audioRef.current) return;

        // Dừng mọi phát lại hiện tại trong khi kiểm tra quyền
        audioRef.current.pause();
        setIsPlaying(false);

        // --- Kiểm Soát Quảng Cáo Phía Server ---
        if (userRef.current) {
            try {
                // Xác định xem có thể phát bài hát này không
                // Chúng ta phải làm điều này TRƯỚC KHI phát audio để ngăn chặn caching/prefetch
                // Tuy nhiên, playSession theo dõi thống kê.
                // Server bây giờ cũng thực thi "giới hạn 3 bài hát".

                const sessionData = await artistService.startPlaySession(song._id);
                // Nếu thành công, chúng ta nhận được sessionId
                currentSessionIdRef.current = sessionData.sessionId;

            } catch (error: any) {
                const msg = error.response?.data?.message || '';
                if (msg === 'AD_REQUIRED' || msg === 'AD_IN_PROGRESS') {
                    console.log("Yêu Cầu Quảng Cáo Từ Server");
                    // Lưu yêu cầu
                    pendingSongRequestRef.current = { song, index };
                    // Hiển thị quảng cáo
                    setShowAd(true);
                    return; // DỪNG TẠI ĐÂY. Không tải source audio.
                }
                // Các lỗi khác (ví dụ: không tìm thấy bài hát), log và có thể tiếp tục hoặc dừng?
                console.error("Lỗi Play Session:", error);
                // Nếu nghiêm trọng, return? Tạm thời giả định thất bại khi bắt đầu session không nên chặn phát lại
                // TRỪ KHI đó là lỗi AD cụ thể.
            }
        }
        // -----------------------------

        setCurrentIndex(index);
        setCurrentSong(song);
        hasCountedRef.current = false;
        // currentSessionIdRef was set above if successful

        audioRef.current.src = song.audioUrl;

        if (!userRef.current) {
            audioRef.current.currentTime = song.previewStart || 0;
            setCurrentTime(0);
        } else {
            audioRef.current.currentTime = 0;
        }

        // Add to history if not already the last one
        setHistory(prev => {
            if (prev.length > 0 && prev[0]._id === song._id) return prev;
            return [song, ...prev].slice(0, 20); // Keep last 20
        });

        try {
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (e) {
            console.error("Play error", e);
            setIsPlaying(false);
        }
    };

    const finishAd = () => {
        setShowAd(false);
        // Play pending song
        if (pendingSongRequestRef.current) {
            const { song, index } = pendingSongRequestRef.current;
            // Retry playing. Server should allow now if 5s passed.
            playSongInternal(song, index);
            pendingSongRequestRef.current = null;
        }
    };

    // This ref allows the useEffect to call the latest playSongInternal
    const playSongInternalRef = useRef(playSongInternal);
    useEffect(() => { playSongInternalRef.current = playSongInternal; });

    // Initialize audio element - RUN ONCE
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.volume = volume;

        const handleTimeUpdate = () => {
            const song = currentSongRef.current; // Use ref to get latest song

            if (!userRef.current && song) {
                const start = song.previewStart || 0;

                // Enforce start boundary
                if (audio.currentTime < start) {
                    audio.currentTime = start;
                }

                // Enforce end boundary (15s limit)
                if (audio.currentTime >= start + 15) {
                    audio.pause();
                    audio.currentTime = start; // Loop back to start
                    setIsPlaying(false);
                    setCurrentTime(15); // Show full bar
                    // Notify user
                    showAlert({
                        title: 'alert_login_required',
                        message: 'alert_login_msg',
                        type: 'login_required'
                    });
                    return;
                }

                // Map actual time to UI time (0...15)
                setCurrentTime(Math.max(0, audio.currentTime - start));
            } else {
                // Normal user
                setCurrentTime(audio.currentTime);

                // Increment play count after 30 seconds
                if (userRef.current && song && !hasCountedRef.current && audio.currentTime >= 30 && currentSessionIdRef.current) {
                    hasCountedRef.current = true;
                    artistService.confirmPlaySession(currentSessionIdRef.current)
                        .catch(err => console.error("Failed to confirm play session", err));
                }
            }
        };

        const handleDurationChange = () => {
            if (!userRef.current && currentSongRef.current) {
                setDuration(15); // Fixed 15s duration for guests
            } else {
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (!userRef.current && currentSongRef.current) {
                setCurrentTime(0);
                audio.currentTime = currentSongRef.current.previewStart || 0;
            } else {
                // Auto play next song if available
                const q = queueRef.current;
                const idx = currentIndexRef.current;
                const shuffle = isShuffleRef.current;
                const repeat = repeatModeRef.current;

                if (q.length === 0) return;

                if (repeat === 'one') {
                    audio.currentTime = 0;
                    audio.play();
                    return;
                }

                let nextIdx = -1;
                if (shuffle) {
                    nextIdx = Math.floor(Math.random() * q.length);
                    if (q.length > 1 && nextIdx === idx) nextIdx = (nextIdx + 1) % q.length;
                } else {
                    if (idx < q.length - 1) {
                        nextIdx = idx + 1;
                    } else if (repeat === 'all') {
                        nextIdx = 0;
                    }
                }

                if (nextIdx !== -1) {
                    const nextTrack = q[nextIdx];
                    playSongInternalRef.current(nextTrack, nextIdx);
                }
            }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        // Ensure seek works when metadata loads
        const handleLoadedMetadata = () => {
            handleDurationChange();
            if (!userRef.current && currentSongRef.current) {
                const start = currentSongRef.current.previewStart || 0;
                if (audio.currentTime < start) {
                    audio.currentTime = start;
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
        };
    }, []); // Empty dependency array - run once

    const playSong = async (song: Song) => {
        // When playing a single song individually, we clear the queue or set it to just this song
        setQueue([song]);
        setCurrentIndex(0);
        await playSongInternal(song, 0);
    };

    const playList = (songs: Song[], startIndex = 0) => {
        if (songs.length === 0) return;
        setQueue(songs);
        playSongInternal(songs[startIndex], startIndex);
    };

    const nextSong = () => {
        const q = queue;
        const idx = currentIndex;

        if (q.length === 0) return;

        let nextIdx = -1;

        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * q.length);
            // Avoid repeating same song if possible
            if (q.length > 1 && nextIdx === idx) {
                nextIdx = (nextIdx + 1) % q.length;
            }
        } else {
            if (idx < q.length - 1) {
                nextIdx = idx + 1;
            } else if (repeatMode !== 'off') {
                nextIdx = 0; // Wrap around
            }
        }

        if (nextIdx !== -1) {
            playSongInternal(q[nextIdx], nextIdx);
        }
    };

    const previousSong = () => {
        if (queue.length > 0 && currentIndex > 0) {
            playSongInternal(queue[currentIndex - 1], currentIndex - 1);
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentSong) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (!userRef.current) {
                const start = currentSong.previewStart || 0;
                if (audioRef.current.currentTime < start || audioRef.current.currentTime >= start + 15) {
                    audioRef.current.currentTime = start;
                }
            }
            audioRef.current.play();
        }
    };

    const seekTo = (time: number) => {
        if (!audioRef.current || !currentSong) return;

        if (!userRef.current) {
            const start = currentSong.previewStart || 0;
            let target = start + time;
            if (target < start) target = start;
            if (target > start + 15) target = start + 15;
            audioRef.current.currentTime = target;
            setCurrentTime(time);
        } else {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const setVolume = (newVolume: number) => {
        if (!audioRef.current) return;
        audioRef.current.volume = newVolume;
        setVolumeState(newVolume);
    };

    return (
        <MusicPlayerContext.Provider
            value={{
                currentSong,
                isPlaying,
                currentTime,
                duration,
                volume,
                playSong,
                togglePlay,
                seekTo,
                setVolume,
                nextSong,
                previousSong,
                playList,
                isShuffle,
                repeatMode,
                toggleShuffle,
                toggleRepeat,
                queue,
                currentIndex,
                history,
                showAd,
                finishAd,
                audioRef
            }}
        >
            {children}
        </MusicPlayerContext.Provider>
    );
};
