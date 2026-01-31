'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import playlistService, { Playlist } from '@/services/playlistService';
import SongCard from '@/components/SongCard';
import { TrashIcon, EllipsisHorizontalIcon, PencilSquareIcon, HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import PlaylistEditModal from '@/components/PlaylistEditModal';
import favoriteService from '@/services/favoriteService';
import { toast } from 'react-hot-toast';
import styles from './PlaylistDetail.module.css';
import { useRef } from 'react';

export default function PlaylistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation('common');
    const { playList } = useMusicPlayer();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkFavorite = async () => {
            if (params.id) {
                try {
                    const favorites = await favoriteService.getFavorites();
                    setIsFavorited(favorites.playlists.some(p => (p._id || p) === params.id));
                } catch (error) {
                    console.error('Failed to check favorite', error);
                }
            }
        };
        checkFavorite();
    }, [params.id]);

    const handleToggleFavorite = async () => {
        if (!playlist) return;
        try {
            await favoriteService.toggleFavoritePlaylist(playlist._id);
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (params.id) {
            fetchPlaylist(params.id as string);
        }
    }, [params.id]);

    const fetchPlaylist = async (id: string) => {
        try {
            setLoading(true);
            const data = await playlistService.getPlaylistById(id);
            setPlaylist(data);
        } catch (error) {
            console.error('Failed to fetch playlist', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = async (songId: string) => {
        if (!playlist) return;
        try {
            await playlistService.removeSongFromPlaylist(playlist._id, songId);
            setPlaylist({
                ...playlist,
                songs: playlist.songs.filter(s => s._id !== songId)
            });
        } catch (error) {
            console.error('Failed to remove song', error);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!playlist) return;
        if (confirm(t('confirm_delete_playlist'))) {
            try {
                await playlistService.deletePlaylist(playlist._id);
                toast.success(t('delete_success', 'Đã xóa playlist'));
                router.push('/playlists');
            } catch (error) {
                console.error('Failed to delete playlist', error);
                toast.error('Failed to delete playlist');
            }
        }
    };

    if (loading) return <div className={styles.loading}>{t('loading')}</div>;
    if (!playlist) return <div className={styles.error}>{t('playlist_not_found')}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.coverWrapper}>
                    {playlist.coverImage ? (
                        <img src={playlist.coverImage} alt={playlist.title} className={styles.cover} />
                    ) : (
                        <div className={styles.coverPlaceholder}>🎵</div>
                    )}
                </div>
                <div className={styles.info}>
                    <div className={styles.type}>{t('playlist')}</div>
                    <h1 className={styles.title}>{playlist.title}</h1>
                    <div className={styles.meta}>
                        {playlist.owner?.fullName || playlist.owner?.username} • {playlist.songs?.length || 0} {t('songs')}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.playButton} onClick={() => playList(playlist.songs, 0)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {t('play_all')}
                        </button>

                        <button
                            className={styles.likeButton}
                            onClick={handleToggleFavorite}
                            title={isFavorited ? t('remove_from_favorites') : t('add_to_favorites')}
                        >
                            {isFavorited ? (
                                <HeartSolidIcon className="w-8 h-8 text-primary" />
                            ) : (
                                <HeartOutlineIcon className="w-8 h-8" />
                            )}
                        </button>

                        <div className={styles.dropdownContainer} ref={menuRef}>
                            <button className={styles.moreButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <EllipsisHorizontalIcon className="w-8 h-8" />
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdown}>
                                    <button className={styles.dropdownItem} onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}>
                                        <PencilSquareIcon className="w-5 h-5" />
                                        {t('edit')}
                                    </button>
                                    <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={handleDeletePlaylist}>
                                        <TrashIcon className="w-5 h-5" />
                                        {t('delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.songs}>
                <div className={styles.songsList}>
                    {playlist.songs && playlist.songs.length > 0 ? (
                        playlist.songs.map((song: any, index: number) => (
                            <div key={song._id} className={styles.songRow}>
                                <div className={styles.songNumber}>{index + 1}</div>
                                <div className={styles.cardWrapper}>
                                    <SongCard song={song} onPlay={() => playList(playlist.songs, index)} variant="list" />
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSong(song._id);
                                    }}
                                    title={t('delete')}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className={styles.empty}>{t('no_songs_in_playlist', 'Danh sách phát này chưa có bài hát nào.')}</p>
                    )}
                </div>
            </div>
            {isEditModalOpen && playlist && (
                <PlaylistEditModal
                    playlist={playlist}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(updated) => setPlaylist({ ...playlist, ...updated })}
                />
            )}
        </div>
    );
}
