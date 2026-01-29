'use client';

import React from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './SongCard.module.css';

interface Song {
    _id: string;
    title: string;
    audioUrl: string;
    coverImage?: string;
    duration: number;
    plays?: number;
    artists: Array<{ _id: string; artistName: string }>;
}

interface SongCardProps {
    song: Song;
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
    const { playSong, currentSong, isPlaying } = useMusicPlayer();

    const isCurrentSong = currentSong?._id === song._id;

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        playSong(song);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={styles.card}>
            <div className={styles.coverWrapper}>
                {song.coverImage ? (
                    <img src={song.coverImage} alt={song.title} className={styles.cover} />
                ) : (
                    <div className={styles.coverPlaceholder}>🎵</div>
                )}
                <button
                    className={`${styles.playButton} ${isCurrentSong && isPlaying ? styles.playing : ''}`}
                    onClick={handlePlay}
                >
                    {isCurrentSong && isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
            </div>
            <div className={styles.info}>
                <div className={styles.title}>{song.title}</div>
                <div className={styles.artist}>
                    {song.artists?.map(a => a.artistName).join(', ') || 'Unknown Artist'}
                </div>
            </div>
            <div className={styles.duration}>{formatDuration(song.duration)}</div>
        </div>
    );
};

export default SongCard;
