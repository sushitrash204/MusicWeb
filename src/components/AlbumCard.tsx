'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import styles from './AlbumCard.module.css';

interface Album {
    _id: string;
    title: string;
    coverImage?: string;
    artist: {
        _id: string;
        artistName: string;
    };
    songs: any[];
    releaseDate: Date;
}

interface AlbumCardProps {
    album: Album;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
    const router = useRouter();
    const { t } = useTranslation('common');

    const handleClick = () => {
        router.push(`/albums/${album._id}`);
    };

    const formatDate = (date: Date) => {
        return new Date(date).getFullYear();
    };

    return (
        <div className={styles.card} onClick={handleClick}>
            <div className={styles.coverWrapper}>
                {album.coverImage ? (
                    <img src={album.coverImage} alt={album.title} className={styles.cover} />
                ) : (
                    <div className={styles.coverPlaceholder}>💿</div>
                )}
            </div>
            <div className={styles.info}>
                <div className={styles.title}>{album.title}</div>
                <div className={styles.artist}>{album.artist.artistName}</div>
                <div className={styles.meta}>
                    {formatDate(album.releaseDate)} • {album.songs?.length || 0} {t('songs')}
                </div>
            </div>
        </div>
    );
};

export default AlbumCard;
