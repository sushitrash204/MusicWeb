'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import albumService from '@/services/albumService';
import AlbumCard from '@/components/AlbumCard';
import ScrollableSection from '@/components/ScrollableSection';
import styles from './Albums.module.css';

export default function AlbumsPage() {
    const { t } = useTranslation('common');
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchAlbums(currentPage);
    }, [currentPage]);

    const fetchAlbums = async (page: number) => {
        try {
            setLoading(true);
            const data = await albumService.getAllAlbums(page, 20, 'releaseDate');
            setAlbums(data.albums);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch albums', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && albums.length === 0) {
        return <div className={styles.loading}>{t('loading', 'Loading...')}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('albums', 'Albums')}</h1>
                <p className={styles.subtitle}>
                    {t('browse_albums', 'Khám phá các album mới nhất')}
                </p>
            </div>

            <div className={styles.grid}>
                {albums.map((album) => (
                    <AlbumCard key={album._id} album={album} />
                ))}
            </div>

            {albums.length === 0 && (
                <p className={styles.empty}>{t('no_albums', 'Chưa có album nào.')}</p>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← {t('previous', 'Trước')}
                    </button>
                    <span className={styles.pageInfo}>
                        {t('page', 'Trang')} {currentPage} / {pagination.totalPages}
                    </span>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                    >
                        {t('next', 'Tiếp')} →
                    </button>
                </div>
            )}
        </div>
    );
}
