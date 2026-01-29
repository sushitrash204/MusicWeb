'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import artistService from '@/services/artistService';
import SongCard from '@/components/SongCard';
import styles from './ArtistProfile.module.css';

export default function ArtistProfilePage() {
    const { t } = useTranslation('common');
    const params = useParams();
    const id = params?.id as string;

    const [artist, setArtist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [artistData, songsData] = await Promise.all([
                    artistService.getArtistById(id),
                    artistService.getArtistSongs(id)
                ]);
                setArtist(artistData);
                setSongs(songsData);
            } catch (error) {
                console.error('Failed to fetch artist profile', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">{t('loading', 'Loading...')}</div>;
    if (!artist) return <div className="flex justify-center items-center min-h-screen">Artist not found</div>;

    // Use avatar from artist profile or fallback
    const avatar = artist.userId?.avatar;
    const name = artist.artistName || artist.userId?.fullName || 'Unknown Artist';

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
                        {/* Placeholder for monthly listeners */}
                        1,234,567 {t('monthly_listeners', 'monthly listeners')}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <section className={styles.popular}>
                    <h2 className={styles.sectionTitle}>{t('popular', 'Popular')}</h2>
                    <div className={styles.songList}>
                        {songs.length > 0 ? (
                            songs.map(song => (
                                <SongCard
                                    key={song._id}
                                    song={{ ...song, artists: song.artists || [{ _id: artist._id, artistName: name }] }}
                                />
                            ))
                        ) : (
                            <p className="text-[var(--text-muted)]">{t('no_songs', 'No songs yet.')}</p>
                        )}
                    </div>
                </section>

                <section className={styles.bio}>
                    <h2 className={styles.bioTitle}>{t('about', 'About')}</h2>
                    <p className={styles.bioText}>
                        {artist.bio || t('no_bio', 'No bio available.')}
                    </p>
                </section>
            </div>
        </div>
    );
}
