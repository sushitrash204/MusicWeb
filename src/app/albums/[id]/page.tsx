'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useAuth } from '@/context/AuthContext';
import albumService from '@/services/albumService';
import SongCard from '@/components/SongCard';
import AddSongModal from '@/components/AddSongModal';
import styles from './AlbumDetail.module.css';

export default function AlbumDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation('common');
    const { playSong, playList } = useMusicPlayer();
    const [album, setAlbum] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchAlbum(params.id as string);
        }
    }, [params.id]);

    const fetchAlbum = async (id: string) => {
        try {
            setLoading(true);
            const data = await albumService.getAlbumById(id);
            setAlbum(data);
        } catch (error) {
            console.error('Failed to fetch album', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAll = () => {
        if (album?.songs && album.songs.length > 0) {
            playList(album.songs, 0);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).getFullYear();
    };

    const { user } = useAuth();
    const [showAddSongModal, setShowAddSongModal] = useState(false);

    // Debugging ownership
    useEffect(() => {
        if (user && album) {
            console.log('User ID:', user._id);
            console.log('Album Artist UserID:', album.artist?.userId);
            console.log('Is Owner:', isOwner);
        }
    }, [user, album]);

    const isOwner = user?._id && album?.artist?.userId && (
        String(user._id) === String(album.artist.userId) ||
        String(user._id) === String(album.artist.userId?._id)
    );

    const handleSongAdded = () => {
        // Refresh album data
        if (params.id) {
            fetchAlbum(params.id as string);
        }
    };

    if (loading) {
        return <div className={styles.loading}>{t('loading')}</div>;
    }

    if (!album) {
        return <div className={styles.error}>{t('album_not_found')}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.coverWrapper}>
                    {album.coverImage ? (
                        <img src={album.coverImage} alt={album.title} className={styles.cover} />
                    ) : (
                        <div className={styles.coverPlaceholder}>💿</div>
                    )}
                </div>
                <div className={styles.info}>
                    <div className={styles.type}>{t('album')}</div>
                    <h1 className={styles.title}>{album.title}</h1>
                    <div className={styles.artist} onClick={() => router.push(`/artist/${album.artist._id}`)}>
                        {album.artist.artistName}
                    </div>
                    {album.description && (
                        <p className={styles.description}>{album.description}</p>
                    )}
                    <div className={styles.meta}>
                        {formatDate(album.releaseDate)} • {album.songs?.length || 0} {t('songs')}
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.playButton} onClick={handlePlayAll}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {t('play_all')}
                        </button>

                        {isOwner && (
                            <button
                                className={styles.addSongButton}
                                onClick={() => setShowAddSongModal(true)}
                            >
                                + {t('add_songs')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.songs}>
                <h2 className={styles.songsTitle}>{t('songs')}</h2>
                <div className={styles.songsList}>
                    {album.songs && album.songs.length > 0 ? (
                        album.songs.map((song: any, index: number) => (
                            <div
                                key={song._id}
                                className={styles.songItem}
                                onClick={() => playList(album.songs, index)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className={styles.songNumber}>{index + 1}</span>
                                <SongCard song={song} />
                            </div>
                        ))
                    ) : (
                        <p className={styles.empty}>{t('no_songs_in_album')}</p>
                    )}
                </div>
            </div>

            {showAddSongModal && (
                <AddSongModal
                    albumId={album._id}
                    existingSongIds={album.songs.map((s: any) => s._id)}
                    onClose={() => setShowAddSongModal(false)}
                    onSuccess={handleSongAdded}
                />
            )}
        </div>
    );
}
