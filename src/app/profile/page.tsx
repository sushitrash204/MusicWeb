'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import artistService from '@/services/artistService';
import ArtistSongs from '@/components/ArtistSongs';
import styles from './Profile.module.css';
import '../../services/i18n';

interface Artist {
    _id: string;
    artistName: string;
    bio: string;
    status: 'pending' | 'active' | 'rejected';
    genres: Array<{ _id: string; name: string }>;
}

export default function ProfilePage() {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user && !localStorage.getItem('accessToken')) {
            router.push('/login');
            return;
        }

        const fetchArtistProfile = async () => {
            try {
                const artistData = await artistService.getMyArtistProfile();
                setArtist(artistData);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setArtist(null); // Truly no profile
                } else {
                    console.error('Failed to load artist profile', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArtistProfile();
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

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>{t('loading')}...</div>
            </div>
        );
    }

    // Artist Profile View (Spotify-like)
    if (artist && artist.status === 'active') {
        return (
            <div className={styles.container}>
                {/* Cover Image */}
                <div className={styles.coverImage}>
                    {/* Gradient overlay */}
                    <div className={styles.coverOverlay}></div>
                </div>

                {/* Header Banner */}
                <div className={styles.headerBanner}>
                    <div className={styles.headerContent}>
                        {/* Artist Avatar */}
                        <div className={styles.artistAvatar}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt={artist.artistName} />
                            ) : (
                                <div className={styles.avatarInitials}>
                                    {artist.artistName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className={styles.verifiedBadge}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z" />
                            </svg>
                            <span>{t('verified_artist')}</span>
                        </div>
                        <h1 className={styles.artistName}>{artist.artistName}</h1>
                        <p className={styles.monthlyListeners}>26,344,579 {t('monthly_listeners')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionBar}>
                    <button className={styles.playButton}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" />
                        </svg>
                    </button>
                    <button
                        className={styles.editButton}
                        onClick={handleEditArtistOpen}
                    >
                        {t('edit_profile')}
                    </button>
                    <button className={styles.moreButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4.5 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm15 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-7.5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                    </button>
                </div>

                {/* Content Section */}
                <div className={styles.contentSection}>
                    <h2 className={styles.sectionTitle}>{t('about')}</h2>

                    <div className={styles.bioSection}>
                        <p className={styles.bioText}>{artist.bio || t('no_bio')}</p>
                    </div>



                    <div className={styles.artistSongsSection}>
                        <ArtistSongs />
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

    // Pending Request View
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
            <div className={styles.centerContent}>
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
            </div>
        </div>
    );
}
