'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartIcon, MusicalNoteIcon, RectangleStackIcon, UserIcon } from '@heroicons/react/24/outline';
import favoriteService, { Favorite } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import PlaylistCard from '@/components/PlaylistCard';
import ArtistCard from '@/components/ArtistCard';
import styles from './Favorites.module.css';

const FavoritesPage = () => {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState<Favorite | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchFavorites();
        }
    }, [user, authLoading]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await favoriteService.getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && user)) {
        return <div className={styles.loading}>{t('loading')}...</div>;
    }

    if (!user) return null;
    if (!favorites && !loading) return null;

    const hasFavorites = favorites ? (
        (favorites.songs?.length ?? 0) > 0 ||
        (favorites.albums?.length ?? 0) > 0 ||
        (favorites.playlists?.length ?? 0) > 0 ||
        (favorites.artists?.length ?? 0) > 0
    ) : false;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                <HeartIcon className="w-8 h-8 text-primary inline-block mr-2" />
                {t('my_favorites', 'Mục yêu thích của tôi')}
            </h1>

            {!hasFavorites ? (
                <div className={styles.emptyState}>
                    {t('no_favorites_yet', 'Bạn chưa có mục yêu thích nào.')}
                </div>
            ) : (
                <>
                    {(favorites?.songs?.length ?? 0) > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <MusicalNoteIcon className="w-6 h-6" />
                                {t('songs')}
                            </h2>
                            <div className={styles.grid} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {favorites?.songs?.map((song) => (
                                    <SongCard key={song._id} song={song} variant="list" />
                                ))}
                            </div>
                        </div>
                    )}

                    {(favorites?.albums?.length ?? 0) > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <RectangleStackIcon className="w-6 h-6" />
                                {t('albums')}
                            </h2>
                            <div className={styles.grid}>
                                {favorites?.albums?.map((album) => (
                                    <AlbumCard key={album._id} album={album} />
                                ))}
                            </div>
                        </div>
                    )}

                    {(favorites?.playlists?.length ?? 0) > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <RectangleStackIcon className="w-6 h-6" />
                                {t('playlists')}
                            </h2>
                            <div className={styles.grid}>
                                {favorites?.playlists?.map((playlist) => (
                                    <PlaylistCard key={playlist._id} playlist={playlist} />
                                ))}
                            </div>
                        </div>
                    )}

                    {(favorites?.artists?.length ?? 0) > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <UserIcon className="w-6 h-6" />
                                {t('artists')}
                            </h2>
                            <div className={styles.grid}>
                                {favorites?.artists?.map((artist) => (
                                    <ArtistCard
                                        key={artist._id}
                                        artist={artist}
                                        onClick={() => {
                                            if ((artist as any).isMe) {
                                                router.push('/profile');
                                            } else {
                                                router.push(`/artist/${artist._id}`);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FavoritesPage;
