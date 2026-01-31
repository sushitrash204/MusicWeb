'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import playlistService from '@/services/playlistService';
import { toast } from 'react-hot-toast';
import PlaylistEditModal from './PlaylistEditModal';
import styles from './PlaylistCard.module.css';

interface PlaylistCardProps {
    playlist: {
        _id: string;
        title: string;
        description?: string;
        coverImage?: string;
        songs?: any[];
        isPublic?: boolean;
    };
    onDeleteSuccess?: (id: string) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist: initialPlaylist, onDeleteSuccess }) => {
    const { t } = useTranslation('common');
    const [playlist, setPlaylist] = useState(initialPlaylist);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(t('confirm_delete_playlist'))) {
            try {
                await playlistService.deletePlaylist(playlist._id);
                toast.success(t('delete_success', 'Đã xóa playlist'));
                if (onDeleteSuccess) onDeleteSuccess(playlist._id);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete playlist');
            }
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditModalOpen(true);
        setIsMenuOpen(false);
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <div style={{ position: 'relative' }}>
                <Link href={`/playlists/${playlist._id}`} className={styles.card}>
                    <div className={styles.imageWrapper}>
                        {playlist.coverImage ? (
                            <img src={playlist.coverImage} alt={playlist.title} className={styles.image} />
                        ) : (
                            <div className={styles.placeholder}>
                                🎵
                            </div>
                        )}
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button className={styles.menuButton} onClick={toggleMenu}>
                                <EllipsisHorizontalIcon className="w-6 h-6" />
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdown}>
                                    <button className={styles.dropdownItem} onClick={handleEdit}>
                                        <PencilSquareIcon className="w-5 h-5" />
                                        {t('edit')}
                                    </button>
                                    <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={handleDelete}>
                                        <TrashIcon className="w-5 h-5" />
                                        {t('delete')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.info}>
                        <h3 className={styles.title}>{playlist.title}</h3>
                        <span className={styles.details}>
                            {playlist.songs?.length || 0} {t('songs')}
                        </span>
                    </div>
                </Link>
            </div>

            {isEditModalOpen && (
                <PlaylistEditModal
                    playlist={playlist as any}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(updated) => setPlaylist({ ...playlist, ...updated })}
                />
            )}
        </>
    );
};

export default PlaylistCard;
