'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import playlistService, { Playlist } from '@/services/playlistService';
import { toast } from 'react-hot-toast';
import styles from './AddToPlaylistModal.module.css';

interface AddToPlaylistModalProps {
    songId: string;
    onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ songId, onClose }) => {
    const { t } = useTranslation('common');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await playlistService.getMyPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error('Failed to fetch playlists', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            await playlistService.addSongToPlaylist(playlistId, songId);
            toast.success(t('add_success'));
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error adding song');
        }
    };

    const handleCreateAndAdd = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            setIsCreating(true);
            const newPlaylist = await playlistService.createPlaylist({
                title: newPlaylistName,
                isPublic: isPublic
            });
            await playlistService.addSongToPlaylist(newPlaylist._id, songId);
            toast.success(t('add_success'));
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error creating playlist');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('add_to_playlist')}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.emptyState}>{t('loading')}</div>
                    ) : playlists.length > 0 ? (
                        <div className={styles.playlistList}>
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist._id}
                                    className={styles.playlistItem}
                                    onClick={() => handleAddToPlaylist(playlist._id)}
                                >
                                    <div className={styles.smallCover}>
                                        {playlist.coverImage ? (
                                            <img src={playlist.coverImage} className="w-full h-full object-cover rounded" />
                                        ) : '🎵'}
                                    </div>
                                    <div className={styles.playlistInfo}>
                                        <span className={styles.playlistName}>{playlist.title}</span>
                                        <span className={styles.playlistSub}>{playlist.songs?.length || 0} {t('songs')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>{t('no_playlists')}</div>
                    )}
                </div>

                <div className={styles.createNewSection}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={t('enter_playlist_name')}
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    <div className={styles.visibilityToggle}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <span>{t('public')}</span>
                        </label>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={handleCreateAndAdd}
                        disabled={!newPlaylistName.trim() || isCreating}
                    >
                        {isCreating ? t('processing') : t('create_and_add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;
