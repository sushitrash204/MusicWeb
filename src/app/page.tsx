'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import artistService from '@/services/artistService';
import ScrollableSection from '@/components/ScrollableSection';
import ArtistCard from '@/components/ArtistCard';
import SongCard from '@/components/SongCard';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [artists, setArtists] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsData, songsData] = await Promise.all([
          artistService.getArtists(),
          artistService.getRecentSongs(10)
        ]);
        setArtists(artistsData);
        setRecentSongs(songsData);
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
              onClick={() => router.push(`/artist/${artist._id}`)}
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
          variant="wide"
          renderItem={(song: any) => (
            <SongCard song={song} />
          )}
        />
        {recentSongs.length === 0 && (
          <p className="text-[var(--text-muted)]">{t('no_songs', 'No songs yet.')}</p>
        )}
      </div>
    </div>
  );
}
