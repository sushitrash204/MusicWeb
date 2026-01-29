import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import artistService from '../services/artistService';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useTranslation } from 'react-i18next';
import styles from './ArtistSongs.module.css';

const ArtistSongs = () => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { playSong } = useMusicPlayer();
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSongs();
    }, []);

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
            setSongs(songs.filter(s => s._id !== id));
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
                        <div key={song._id} className={styles.songItem}>
                            <button
                                className={styles.playIconButton}
                                onClick={() => handlePlay(song)}
                                title="Play"
                            >
                                ▶
                            </button>
                            <div className={styles.songInfo}>
                                <div className={styles.songTitle}>{song.title}</div>
                                <div className={styles.songMeta}>{song.duration}s • {song.plays || 0} plays</div>
                            </div>
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(song._id)}
                            >
                                {t('delete', 'Delete')}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ArtistSongs;
