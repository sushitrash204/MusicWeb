import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import artistService from '../services/artistService';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useTranslation } from 'react-i18next';
import SongCard from './SongCard';
import styles from './ArtistSongs.module.css';

interface ArtistSongsProps {
    songs?: any[];
    loading?: boolean;
    onRefresh?: () => void;
    // Controlled mode props
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
}

const ArtistSongs = ({
    songs: propSongs,
    loading: propLoading,
    onRefresh,
    hasMore: propHasMore,
    loadingMore: propLoadingMore,
    onLoadMore
}: ArtistSongsProps) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { playList } = useMusicPlayer();
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const LIMIT = 5;

    useEffect(() => {
        if (propSongs) {
            setSongs(propSongs);
            setLoading(propLoading ?? false);
        } else {
            fetchSongs();
        }
    }, [propSongs, propLoading]);

    const fetchSongs = async (reset = false) => {
        // If controlled mode, do not fetch internally
        if (onLoadMore) return;

        try {
            if (reset) {
                setLoading(true);
                setOffset(0);
            } else {
                setLoadingMore(true);
            }

            const currentOffset = reset ? 0 : offset;
            const data = await artistService.getMySongs({ limit: LIMIT, offset: currentOffset });

            if (data.length < LIMIT) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setSongs(prev => {
                if (reset) return data;
                const existingIds = new Set(prev.map(s => s._id));
                const uniqueNewSongs = data.filter((s: any) => !existingIds.has(s._id));
                return [...prev, ...uniqueNewSongs];
            });
            setOffset(currentOffset + LIMIT);
        } catch (error) {
            console.error('Failed to fetch songs', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!propSongs) {
            fetchSongs(true);
        }
    }, [propSongs]);

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete_song', 'Are you sure you want to delete this song?'))) return;
        try {
            await artistService.deleteSong(id);
            if (onRefresh) {
                onRefresh();
            } else {
                setSongs(songs.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete song', error);
        }
    };

    const handlePlay = (song: any) => {
        const index = songs.findIndex(s => s._id === song._id);
        if (index !== -1) {
            playList(songs, index);
        }
    };

    if (loading) return <div>{t('loading')}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t('my_songs', 'My Songs')}</h3>
                <button
                    className={styles.addButton}
                    onClick={() => router.push('/songs/new')}
                >
                    + {t('add_song', 'Add Song')}
                </button>
            </div>

            <div className={styles.songList}>
                {songs.length === 0 ? (
                    <p className={styles.empty}>{t('no_songs', 'No songs uploaded yet.')}</p>
                ) : (
                    songs.map((song) => (
                        <div key={song._id} className={styles.songRow}>
                            <SongCard
                                song={song}
                                variant="list"
                                onPlay={handlePlay}
                            />
                            <div className={styles.adminActions}>
                                <button
                                    className={styles.editButton}
                                    onClick={() => router.push(`/songs/edit/${song._id}`)}
                                >
                                    {t('edit', 'Edit')}
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(song._id)}
                                >
                                    {t('delete', 'Delete')}
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {(propHasMore !== undefined ? propHasMore : hasMore) && !loading && (
                    <div className={styles.showMoreContainer}>
                        <button
                            className={styles.showMoreButton}
                            onClick={() => onLoadMore ? onLoadMore() : fetchSongs(false)}
                            disabled={propLoadingMore !== undefined ? propLoadingMore : loadingMore}
                        >
                            {(propLoadingMore !== undefined ? propLoadingMore : loadingMore) ? t('loading') + '...' : t('show_more', 'Show More')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistSongs;
