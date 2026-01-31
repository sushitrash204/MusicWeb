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
}

const ArtistSongs = ({ songs: propSongs, loading: propLoading, onRefresh }: ArtistSongsProps) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { playSong } = useMusicPlayer();
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (propSongs) {
            setSongs(propSongs);
            setLoading(propLoading ?? false);
        } else {
            fetchSongs();
        }
    }, [propSongs, propLoading]);

    const fetchSongs = async () => {
        try {
            const data = await artistService.getMySongs();
            setSongs(data);
        } catch (error) {
            console.error('Failed to fetch songs', error);
        } finally {
            setLoading(false);
        }
    };

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
        playSong(song);
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
            </div>
        </div>
    );
};

export default ArtistSongs;
