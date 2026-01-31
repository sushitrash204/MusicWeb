'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import playlistService, { Playlist } from '@/services/playlistService';
import { toast } from 'react-hot-toast';
import styles from './PlaylistEditModal.module.css';

interface PlaylistEditModalProps {
    playlist: Playlist;
    onClose: () => void;
    onUpdate: (updatedPlaylist: Playlist) => void;
}

const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({ playlist, onClose, onUpdate }) => {
    const { t } = useTranslation('common');
    const [title, setTitle] = useState(playlist.title);
    const [description, setDescription] = useState(playlist.description || '');
    const [isPublic, setIsPublic] = useState(playlist.isPublic || false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;

        try {
            setIsSaving(true);
            const updated = await playlistService.updatePlaylist(playlist._id, {
                title,
                description,
                isPublic
            });
            toast.success(t('update_success', 'Cập nhật thành công!'));
            onUpdate(updated);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update playlist');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('edit_playlist')}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('playlist_name')}</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('playlist_title')}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('playlist_description')}</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('playlist_desc')}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <span>{t('public')}</span>
                        </label>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        {t('cancel')}
                    </button>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!title.trim() || isSaving}
                    >
                        {isSaving ? t('saving') : t('save_changes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistEditModal;
