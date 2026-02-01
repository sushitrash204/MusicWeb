'use client';

import React from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useTranslation } from 'react-i18next';
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
    onPlay?: (song: Song) => void;
    variant?: 'grid' | 'list';
}

import { PlusIcon, HeartIcon as HeartOutlineIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import AddToPlaylistModal from './AddToPlaylistModal';
import favoriteService from '@/services/favoriteService';

const SongCard: React.FC<SongCardProps> = ({ song, onPlay, variant = 'grid' }) => {
    const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer();
    const { t } = useTranslation('common');
    const [showPlaylistModal, setShowPlaylistModal] = React.useState(false);
    const [isFavorited, setIsFavorited] = React.useState(false);

    React.useEffect(() => {
        const checkFavorite = async () => {
            try {
                const favorites = await favoriteService.getFavorites();
                setIsFavorited(favorites.songs.some(s => (s._id || s) === song._id));
            } catch (error) {
                console.error('Failed to check favorite', error);
            }
        };
        checkFavorite();
    }, [song._id]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await favoriteService.toggleFavoriteSong(song._id);
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    const titleRef = React.useRef<HTMLDivElement>(null);
    const [isOverflown, setIsOverflown] = React.useState(false);

    React.useEffect(() => {
        const checkOverflow = () => {
            if (titleRef.current) {
                const { scrollWidth, clientWidth } = titleRef.current;
                setIsOverflown(scrollWidth > clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [song.title]);

    const isCurrentSong = currentSong?._id === song._id;

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCurrentSong) {
            togglePlay();
        } else if (onPlay) {
            onPlay(song);
        } else {
            playSong(song);
        }
    };

    const handleAddToPlaylist = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowPlaylistModal(true);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={`${styles.card} ${variant === 'list' ? styles.listVariant : ''}`}
            onClick={handlePlay}
        >
            <div className={styles.coverWrapper}>
                {song.coverImage ? (
                    <img src={song.coverImage} alt={song.title} className={styles.cover} />
                ) : (
                    <div className={styles.coverPlaceholder}>🎵</div>
                )}
                <button
                    className={`${styles.playButton} ${isCurrentSong && isPlaying ? styles.playing : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(e);
                    }}
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
                <div
                    className={`${styles.title} ${isOverflown ? styles.canScroll : ''}`}
                    ref={titleRef}
                >
                    {isOverflown ? (
                        <span className={styles.titleText}>{song.title} &nbsp;&nbsp;&nbsp; {song.title}</span>
                    ) : (
                        <span className={styles.titleStatic}>{song.title}</span>
                    )}
                </div>
                <div className={styles.artist}>
                    {song.artists?.map(a => a.artistName).join(', ') || t('unknown_artist')}
                </div>
            </div>

            {variant === 'list' && (
                <div className={styles.playsCenter}>
                    {(song.plays || 0).toLocaleString()}
                </div>
            )}

            <div className={styles.actions}>
                <div className={styles.mainActions}>
                    <button
                        className={styles.actionBtn}
                        onClick={handleToggleFavorite}
                        title={isFavorited ? t('remove_from_favorites') : t('add_to_favorites')}
                    >
                        {isFavorited ? (
                            <HeartSolidIcon className="w-5 h-5 text-primary" />
                        ) : (
                            <HeartOutlineIcon className="w-5 h-5" />
                        )}
                    </button>
                    <button className={styles.actionBtn} onClick={handleAddToPlaylist}>
                        <PlusIcon className="w-5 h-5" />
                    </button>
                    {variant === 'list' && (
                        <div className={styles.verifiedWrap}>
                            <CheckCircleIcon className="w-5 h-5 text-primary" />
                        </div>
                    )}
                </div>
                <div className={styles.duration}>{formatDuration(song.duration)}</div>
            </div>

            {showPlaylistModal && (
                <AddToPlaylistModal
                    songId={song._id}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </div>
    );
};

export default SongCard;
