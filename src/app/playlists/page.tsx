'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import playlistService, { Playlist } from '@/services/playlistService';
import PlaylistCard from '@/components/PlaylistCard';
import styles from './Playlists.module.css';

export default function PlaylistsPage() {
    const { t } = useTranslation('common');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await playlistService.getMyPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error('Failed to fetch playlists', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>{t('loading')}</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('my_playlists')}</h1>
            </header>

            {playlists && playlists.length > 0 ? (
                <div className={styles.grid}>
                    {playlists.map((playlist) => (
                        <PlaylistCard
                            key={playlist._id}
                            playlist={playlist}
                            onDeleteSuccess={(id) => setPlaylists(playlists.filter(p => p._id !== id))}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>🎵</div>
                    <p>{t('no_playlists')}</p>
                    <p className={styles.hint}>{t('preview_hint', 'Bạn có thể tạo playlist mới bằng cách nhấn vào nút + trên bất kỳ bài hát nào.')}</p>
                </div>
            )}
        </div>
    );
}
