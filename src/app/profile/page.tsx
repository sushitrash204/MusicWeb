'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import artistService from '@/services/artistService';
import albumService from '@/services/albumService';
import ArtistSongs from '@/components/ArtistSongs';
import AlbumCard from '@/components/AlbumCard';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './Profile.module.css';
import '../../services/i18n';

interface Artist {
    _id: string;
    artistName: string;
    bio: string;
    totalStreams: number;
    status: 'pending' | 'active' | 'rejected';
    genres: Array<{ _id: string; name: string }>;
}

export default function ProfilePage() {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const { playList } = useMusicPlayer();
    const router = useRouter();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<any[]>([]);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSongs, setLoadingSongs] = useState(true);

    const fetchArtistProfile = async () => {
        try {
            const [artistData, albumsData] = await Promise.all([
                artistService.getMyArtistProfile(),
                albumService.getMyAlbums()
            ]);
            setArtist(artistData);
            setAlbums(albumsData);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setArtist(null); // Truly no profile
            } else {
                console.error('[Profile] Failed to load artist profile', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSongs = async () => {
        setLoadingSongs(true);
        try {
            const data = await artistService.getMySongs();
            setSongs(data);
        } catch (error) {
            console.error('Failed to fetch songs', error);
        } finally {
            setLoadingSongs(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user && !localStorage.getItem('accessToken')) {
            router.push('/login');
            return;
        }

        fetchArtistProfile();
        fetchSongs();
    }, [user, authLoading, router]);

    // Artist Edit State
    const [isEditArtistOpen, setIsEditArtistOpen] = useState(false);
    const [editArtistForm, setEditArtistForm] = useState({ artistName: '', bio: '' });
    const [updateLoading, setUpdateLoading] = useState(false);

    const handleEditArtistOpen = () => {
        if (artist) {
            setEditArtistForm({
                artistName: artist.artistName,
                bio: artist.bio || ''
            });
            setIsEditArtistOpen(true);
        }
    };

    const handleEditArtistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const updatedArtist = await artistService.updateArtistProfile(editArtistForm);
            setArtist(updatedArtist);
            setIsEditArtistOpen(false);
        } catch (error) {
            console.error('Failed to update artist profile', error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playList(songs);
        }
    };

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>{t('loading')}...</div>
            </div>
        );
    }

    // Artist Profile View (Spotify-like)
    if (artist && artist.status === 'active') {
        const avatar = user?.avatar;
        const name = artist.artistName;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    {avatar ? (
                        <img src={avatar} alt={name} className={styles.avatar} />
                    ) : (
                        <div className={styles.placeholderAvatar}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className={styles.info}>
                        <div className={styles.verified}>
                            <svg className={styles.verifiedIcon} viewBox="0 0 24 24">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.8-6.8 1.5 1.5-8.3 8.3z" />
                            </svg>
                            {t('verified_artist', 'Verified Artist')}
                        </div>
                        <h1 className={styles.name}>{name}</h1>
                        <div className={styles.stats}>
                            {(artist.totalStreams || 0).toLocaleString()} {t('total_streams', 'total streams')}
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.playAllButton}
                                onClick={handlePlayAll}
                                disabled={songs.length === 0}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                {t('play_all', 'Phát tất cả')}
                            </button>
                            <button
                                className={styles.editButton}
                                onClick={handleEditArtistOpen}
                            >
                                {t('edit_profile')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className={styles.contentSection}>
                    <h2 className={styles.sectionTitle}>{t('about')}</h2>

                    <div className={styles.bioSection}>
                        <p className={styles.bioText}>{artist.bio || t('no_bio')}</p>
                    </div>

                    <div className={styles.artistSongsSection}>
                        <ArtistSongs
                            songs={songs}
                            loading={loadingSongs}
                            onRefresh={fetchSongs}
                        />
                    </div>

                    <div className={styles.albumsSection} style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{t('albums')}</h2>
                            <button
                                className={styles.primaryButton}
                                style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}
                                onClick={() => router.push('/albums/new')}
                            >
                                + {t('add_album')}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                            {albums.length > 0 ? (
                                albums.map(album => (
                                    <AlbumCard key={album._id} album={{ ...album, artist: { _id: artist._id, artistName: artist.artistName } }} />
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>{t('no_albums_yet')}</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Edit Artist Modal */}
                {isEditArtistOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>{t('edit_profile')}</h2>
                            <form onSubmit={handleEditArtistSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>{t('artist_name')}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={editArtistForm.artistName}
                                        onChange={(e) => setEditArtistForm({ ...editArtistForm, artistName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>{t('artist_bio')}</label>
                                    <textarea
                                        className={styles.textArea}
                                        value={editArtistForm.bio}
                                        onChange={(e) => setEditArtistForm({ ...editArtistForm, bio: e.target.value })}
                                        placeholder={t('artist_bio_placeholder')}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.editButton} onClick={() => setIsEditArtistOpen(false)}>
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className={styles.primaryButton} disabled={updateLoading}>
                                        {updateLoading ? t('saving') : t('save_changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Pending Request View - NOW WITH SONGS!
    if (artist && artist.status === 'pending') {
        return (
            <div className={styles.container}>
                <div className={styles.centerContent}>
                    <div className={styles.statusCard}>
                        <div className={styles.statusIcon}>⏳</div>
                        <h2>{t('request_pending')}</h2>
                        <p className={styles.statusDescription}>
                            {t('request_pending_description')}
                        </p>
                    </div>
                </div>

                {/* Show songs even when pending */}
                <div className={styles.contentSection} style={{ marginTop: '2rem' }}>
                    <div className={styles.artistSongsSection}>
                        <ArtistSongs
                            songs={songs}
                            loading={loadingSongs}
                            onRefresh={fetchSongs}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Rejected Request View
    if (artist && artist.status === 'rejected') {
        return (
            <div className={styles.container}>
                <div className={styles.centerContent}>
                    <div className={styles.statusCard}>
                        <div className={styles.statusIcon}>❌</div>
                        <h2>{t('request_rejected')}</h2>
                        <p className={styles.statusDescription}>
                            {t('request_rejected_description')}
                        </p>
                        <button
                            className={styles.primaryButton}
                            onClick={() => router.push('/artist-request')}
                        >
                            {t('reapply')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Regular User Profile View
    return (
        <div className={styles.container}>
            <div className={styles.centerContent} style={{ flexDirection: 'column', minHeight: 'auto', paddingTop: '6rem' }}>
                <div className={styles.userProfileCard}>
                    <div className={styles.userAvatar}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.fullName} />
                        ) : (
                            <div className={styles.avatarInitials}>
                                {user?.fullName?.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h1 className={styles.userName}>{user?.fullName}</h1>
                    <p className={styles.userUsername}>@{user?.username}</p>

                    <button
                        className={styles.editButton}
                        onClick={() => router.push('/settings')}
                        style={{ marginBottom: '2rem' }}
                    >
                        {t('edit_profile')}
                    </button>

                    <div className={styles.divider}></div>

                    <div className={styles.becomeArtistSection}>
                        <h3>{t('become_artist')}</h3>
                        <p className={styles.becomeArtistDescription}>
                            {t('become_artist_description')}
                        </p>
                        <button
                            className={styles.primaryButton}
                            onClick={() => router.push('/artist-request')}
                        >
                            {t('apply_now')}
                        </button>
                    </div>
                </div>

                <div className={styles.likedSongsWrapper} style={{ width: '100%', maxWidth: '1200px', marginTop: '4rem' }}>
                    <h2 className={styles.sectionTitle}>{t('liked_songs')}</h2>
                    <div className={styles.likedSongsContent} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{t('no_favorites')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
