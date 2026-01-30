'use client';

import React, { useState } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useTranslation } from 'react-i18next';
import styles from './MusicPlayer.module.css';

const MusicPlayer = () => {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        seekTo,
        setVolume,
        nextSong,
        previousSong,
        isShuffle,
        repeatMode,
        toggleShuffle,
        toggleRepeat
    } = useMusicPlayer();
    const { t } = useTranslation('common');

    const [showVolume, setShowVolume] = useState(false);

    if (!currentSong) return null;

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        seekTo(Number(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={styles.player}>
            {/* Left: Song Info */}
            <div className={styles.songInfo}>
                <div className={styles.cover}>
                    {currentSong.coverImage ? (
                        <img src={currentSong.coverImage} alt={currentSong.title} />
                    ) : (
                        <div className={styles.coverPlaceholder}>🎵</div>
                    )}
                </div>
                <div className={styles.details}>
                    <div className={styles.songTitle}>{currentSong.title}</div>
                    <div className={styles.artistName}>
                        {currentSong.artists?.map((a: any) => a.artistName).join(', ') || 'Unknown Artist'}
                    </div>
                </div>
                <button className={styles.likeButton}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14s-6-4-6-8c0-2.5 2-4 4-4 1.5 0 2.5 1 2 2s1.5-2 2-2c2 0 4 1.5 4 4 0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
            </div>

            {/* Center: Controls */}
            <div className={styles.controls}>
                <div className={styles.buttons}>
                    <button
                        className={`${styles.controlButton} ${isShuffle ? styles.active : ''}`}
                        onClick={toggleShuffle}
                        title={t('shuffle')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z" />
                            <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z" />
                        </svg>
                    </button>

                    <button className={styles.controlButton} onClick={previousSong}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
                        </svg>
                    </button>

                    <button className={styles.playButton} onClick={togglePlay}>
                        {isPlaying ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3 2h3v12H3V2zm7 0h3v12h-3V2z" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M3 2l10 6-10 6V2z" />
                            </svg>
                        )}
                    </button>

                    <button className={styles.controlButton} onClick={nextSong}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
                        </svg>
                    </button>

                    <button
                        className={`${styles.controlButton} ${repeatMode !== 'off' ? styles.active : ''}`}
                        onClick={toggleRepeat}
                        title={repeatMode === 'one' ? t('repeat_one') : repeatMode === 'all' ? t('repeat_all') : t('repeat_off')}
                    >
                        {repeatMode === 'one' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className={styles.progressContainer}>
                    <span className={styles.time}>{formatTime(currentTime)}</span>
                    <div className={styles.progressBar}>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className={styles.progressInput}
                            style={{ '--progress': `${progress}%` } as React.CSSProperties}
                        />
                    </div>
                    <span className={styles.time}>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Volume */}
            <div className={styles.rightControls}>
                <button
                    className={styles.volumeButton}
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M9.741.85a.8.8 0 0 1 .8.8v13.5a.8.8 0 0 1-1.296.624l-5.675-4.253H1a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1h2.57l5.675-4.253a.8.8 0 0 1 .496-.397z" />
                        {volume > 0.5 && <path d="M11.5 4.5a4.5 4.5 0 0 1 0 7" />}
                        {volume > 0 && <path d="M13 2a7 7 0 0 1 0 12" />}
                    </svg>
                    {showVolume && (
                        <div className={styles.volumeSlider}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className={styles.volumeInput}
                            />
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MusicPlayer;
