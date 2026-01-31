import React, { useRef, useMemo, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './LyricsPanel.module.css';

interface LyricsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    lyrics?: string;
    title: string;
    artist: string;
    coverImage?: string;
    isQueueOpen?: boolean;
    currentTime?: number;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({ isOpen, onClose, lyrics, title, artist, coverImage, isQueueOpen, currentTime = 0 }) => {
    const { t } = useTranslation('common');
    const { seekTo } = useMusicPlayer();
    const lyricsContainerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLParagraphElement>(null);

    // Identify if lyrics are simple text or JSON
    const parsedLyrics = useMemo(() => {
        if (!lyrics || lyrics === '[]') return [];
        try {
            const json = JSON.parse(lyrics);
            if (Array.isArray(json)) return json;
        } catch (e) {
            // Not JSON
        }
        return lyrics.split('\n').map(text => ({ time: 0, text }));
    }, [lyrics]);

    const isSynced = useMemo(() => {
        return parsedLyrics.length > 0 && parsedLyrics.some((l: any) => l.time > 0);
    }, [parsedLyrics]);

    // Find active line index based on currentTime
    const activeIndex = useMemo(() => {
        if (!isSynced) return -1;
        // Find the last line that has time <= currentTime
        // Note: parsedLyrics are hopefully sorted by time, but let's assume they are.
        let idx = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (currentTime >= parsedLyrics[i].time) {
                idx = i;
            } else {
                break; // Found a line in future, stop
            }
        }
        return idx;
    }, [isSynced, currentTime, parsedLyrics]);

    // Auto-scroll to active line
    useEffect(() => {
        if (isOpen && activeIndex !== -1 && activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex, isOpen]);

    const handleLyricClick = (time: number) => {
        if (isSynced && time >= 0) {
            seekTo(time);
        }
    };

    // Always render to allow CSS transitions, control visibility with classes
    return (
        <div className={`${styles.lyricsPanel} ${isOpen ? styles.open : ''} ${isQueueOpen ? styles.isQueueOpen : ''}`}>
            <button className={styles.closeBtn} onClick={onClose}>
                <XMarkIcon className="w-8 h-8" />
            </button>

            <div className={styles.contentWrapper}>
                {/* Left Side: Song Info */}
                <div className={styles.infoColumn}>
                    <div className={styles.infoContent}>
                        <div className={styles.coverImageWrapper}>
                            {coverImage ? (
                                <img src={coverImage} alt={title} className={styles.coverImage} />
                            ) : (
                                <div className={styles.coverPlaceholder}>🎵</div>
                            )}
                        </div>
                        <div className={styles.songMetadata}>
                            <h2 className={styles.songTitle}>{title}</h2>
                            <p className={styles.artistName}>{artist}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Lyrics */}
                <div className={styles.lyricsColumn} ref={lyricsContainerRef}>
                    {parsedLyrics.length > 0 ? (
                        <div className={styles.lyricsContainer}>
                            {parsedLyrics.map((line: any, index: number) => {
                                const isActive = index === activeIndex;
                                return (
                                    <p
                                        key={index}
                                        ref={isActive ? activeLineRef : null}
                                        className={`${styles.lyricLine} ${isActive ? styles.active : ''} ${isSynced ? styles.synced : ''}`}
                                        onClick={() => handleLyricClick(line.time)}
                                    >
                                        {line.text || '\u00A0'}
                                    </p>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noLyrics}>
                            <p>{t('no_lyrics', 'No lyrics available for this song.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LyricsPanel;
