'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import artistService from '@/services/artistService';
import albumService from '@/services/albumService';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import ScrollableSection from '@/components/ScrollableSection';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import favoriteService from '@/services/favoriteService';
import { toast } from 'react-hot-toast';
import styles from './ArtistProfile.module.css';

export function generateStaticParams() {
    return [];
}

export default function ArtistProfilePage() {
    const { t } = useTranslation('common');
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { playList } = useMusicPlayer();
    const id = params?.id as string;

    const [artist, setArtist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const handlePlayAll = () => {
        if (songs.length > 0) {
            playList(songs, 0);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        try {
            await favoriteService.followArtist(id);
            setIsFollowing(!isFollowing);
            toast.success(isFollowing ? t('unfollowed') : t('followed'));
        } catch (error) {
            console.error('Failed to follow artist', error);
        }
    };

    const handlePlaySong = (song: any) => {
        const index = songs.findIndex(s => s._id === song._id);
        if (index !== -1) {
            playList(songs, index);
        }
    };

    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                console.warn('Fetch timed out for artist ID:', id);
                setLoading(false);
            }
        }, 10000); // 10s timeout safety

        const fetchData = async () => {
            console.log('Fetching artist data for ID:', id);
            try {
                setLoading(true);
                // Fetch artist info first for immediate UI feedback
                const artistData = await artistService.getArtistById(id);

                if (isMounted) {
                    console.log('Artist data received:', artistData);
                    if (artistData.isMe) {
                        router.replace('/profile');
                        return;
                    }
                    setArtist(artistData);
                    setLoading(false); // Stop main loading
                }

                // Check following status if user is logged in
                if (user && isMounted) {
                    const favorites = await favoriteService.getFavorites();
                    setIsFollowing(favorites.artists.some(a => (a._id || a) === id));
                }

                // Fetch songs and albums in parallel
                console.log('Fetching songs and albums...');
                const [songsData, albumsData] = await Promise.all([
                    artistService.getArtistSongs(id),
                    albumService.getAlbumsByArtist(id)
                ]);

                if (isMounted) {
                    console.log('Songs and albums received');
                    setSongs(songsData);
                    setAlbums(albumsData);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to fetch artist profile:', error);
                    setLoading(false);
                }
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
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
                            className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
                            onClick={handleFollow}
                        >
                            {isFollowing ? t('following', 'Đang theo dõi') : t('follow', 'Theo dõi')}
                        </button>
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
                                    onPlay={handlePlaySong}
                                    variant="list"
                                />
                            ))
                        ) : (
                            <p className="text-[var(--text-muted)]">{t('no_songs', 'No songs yet.')}</p>
                        )}
                    </div>
                </section>

                <div className="mb-8">
                    <ScrollableSection
                        title={t('albums', 'Albums')}
                        items={albums}
                        keyExtractor={(album: any) => album._id}
                        renderItem={(album: any) => (
                            <AlbumCard album={album} />
                        )}
                    />
                    {albums.length === 0 && (
                        <p className="text-[var(--text-muted)] ml-4">{t('no_albums', 'No albums yet.')}</p>
                    )}
                </div>

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
