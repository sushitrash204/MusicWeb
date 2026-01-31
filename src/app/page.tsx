'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import artistService from '@/services/artistService';
import ScrollableSection from '@/components/ScrollableSection';
import ArtistCard from '@/components/ArtistCard';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import albumService from '@/services/albumService';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { playList } = useMusicPlayer();
  const [artists, setArtists] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [popularSongs, setPopularSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsData, songsData, popularData, albumsData] = await Promise.all([
          artistService.getArtists(),
          artistService.getRecentSongs(10),
          artistService.getPopularSongs(10),
          albumService.getAllAlbums(1, 10, 'releaseDate')
        ]);
        setArtists(artistsData);
        setRecentSongs(songsData);
        setPopularSongs(popularData);
        setAlbums(albumsData.albums || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('loading', 'Loading...')}</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {t('discover_music', 'Discover Music')}
        </h1>
        <p className="text-[var(--text-muted)] mt-2">
          {user ? `${t('welcome', 'Welcome')}, ${user.fullName || user.username}!` : t('home_description', 'Listen to millions of songs and podcasts for free.')}
        </p>
      </div>

      <div className="mb-8">
        <ScrollableSection
          title={t('top_artists', 'Top Artists')}
          items={artists}
          keyExtractor={(artist: any) => artist._id}
          renderItem={(artist: any) => (
            <ArtistCard
              artist={artist}
              onClick={() => {
                if (artist.isMe) {
                  router.push('/profile');
                } else {
                  router.push(`/artist/${artist._id}`);
                }
              }}
            />
          )}
        />
        {artists.length === 0 && (
          <p className="text-[var(--text-muted)]">{t('no_artists', 'No artists yet.')}</p>
        )}
      </div>

      <div className="mb-8">
        <ScrollableSection
          title={t('new_releases', 'New Releases')}
          items={recentSongs}
          keyExtractor={(song: any) => song._id}
          renderItem={(song: any) => (
            <SongCard
              song={song}
              onPlay={(s) => {
                const idx = recentSongs.findIndex(rs => rs._id === s._id);
                if (idx !== -1) playList(recentSongs, idx);
              }}
            />
          )}
        />
        {recentSongs.length === 0 && (
          <p className="text-[var(--text-muted)]">{t('no_songs', 'No songs yet.')}</p>
        )}
      </div>

      <div className="mb-8">
        <ScrollableSection
          title={t('popular_songs', 'Popular Songs')}
          items={popularSongs}
          keyExtractor={(song: any) => song._id}
          renderItem={(song: any) => (
            <SongCard
              song={song}
              onPlay={(s) => {
                const idx = popularSongs.findIndex(rs => rs._id === s._id);
                if (idx !== -1) playList(popularSongs, idx);
              }}
            />
          )}
        />
        {popularSongs.length === 0 && (
          <p className="text-[var(--text-muted)]">{t('no_songs', 'No songs yet.')}</p>
        )}
      </div>

      <div className="mb-8">
        <ScrollableSection
          title={t('new_albums', 'New Albums')}
          items={albums}
          keyExtractor={(album: any) => album._id}
          renderItem={(album: any) => (
            <AlbumCard album={album} />
          )}
        />
        {albums.length === 0 && (
          <p className="text-[var(--text-muted)]">{t('no_albums', 'No albums yet.')}</p>
        )}
      </div>
    </div>
  );
}
