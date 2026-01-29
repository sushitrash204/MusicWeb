'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { toast } from 'react-hot-toast';

interface Song {
    _id: string;
    title: string;
    audioUrl: string;
    coverImage?: string;
    duration: number;
    artists: any[];
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
    const currentSongRef = useRef<Song | null>(null); // Ref for event listener access

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);

    const { user } = useAuth();
    const { showAlert } = useAlert();
    const userRef = useRef(user);

    // Sync refs
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        currentSongRef.current = currentSong;
    }, [currentSong]);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            const song = currentSongRef.current;

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
            }
        };

        const handleDurationChange = () => {
            if (!userRef.current) {
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
    }, []);

    const playSong = async (song: Song) => {
        if (!audioRef.current) return;

        // If same song, just toggle play
        if (currentSong?._id === song._id) {
            togglePlay();
            return;
        }

        setCurrentSong(song);
        currentSongRef.current = song;

        audioRef.current.src = song.audioUrl;

        // Start position for guest
        if (!userRef.current) {
            audioRef.current.currentTime = song.previewStart || 0;
            setDuration(15);
            setCurrentTime(0);
        } else {
            audioRef.current.currentTime = 0;
        }

        try {
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (e) {
            console.error("Play error", e);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentSong) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Check resume position for guests
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
            // UI gives 0-15. Map to start + time.
            let target = start + time;

            // Safety clamp
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

    const nextSong = () => {
        // TODO: Implement playlist logic
        console.log('Next song');
    };

    const previousSong = () => {
        // TODO: Implement playlist logic
        console.log('Previous song');
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
                previousSong
            }}
        >
            {children}
        </MusicPlayerContext.Provider>
    );
};
