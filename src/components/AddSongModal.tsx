'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import artistService from '@/services/artistService';
import albumService from '@/services/albumService';
import styles from './AddSongModal.module.css';

interface AddSongModalProps {
    albumId: string;
    existingSongIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddSongModal({ albumId, existingSongIds, onClose, onSuccess }: AddSongModalProps) {
    const { t } = useTranslation('common');
    const [songs, setSongs] = useState<any[]>([]);
    const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMySongs();
    }, []);

    const fetchMySongs = async () => {
        try {
            setLoading(true);
            const data = await artistService.getMySongs();
            // Filter out songs that are already in the album
            const availableSongs = data.filter((song: any) => !existingSongIds.includes(song._id));
            setSongs(availableSongs);
        } catch (err: any) {
            console.error('Failed to fetch songs', err);
            setError(t('failed_to_load_songs', 'Không thể tải danh sách bài hát'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (songId: string) => {
        setSelectedSongs(prev => {
            if (prev.includes(songId)) {
                return prev.filter(id => id !== songId);
            } else {
                return [...prev, songId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedSongs.length === songs.length) {
            setSelectedSongs([]);
        } else {
            setSelectedSongs(songs.map(song => song._id));
        }
    };

    const handleSubmit = async () => {
        if (selectedSongs.length === 0) return;

        setAdding(true);
        setError('');

        try {
            // Add songs sequentially to ensure order/stability, or Promise.all for speed
            // Since backend likely handles one by one, Promise.all is fine but might hit rate limits if too many.
            // Let's use Promise.all for now as count is usually small.
            await Promise.all(selectedSongs.map(songId => albumService.addSongToAlbum(albumId, songId)));

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to add songs', err);
            setError(err.response?.data?.message || t('failed_to_add_songs', 'Thêm bài hát thất bại'));
            setAdding(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('add_songs_to_album', 'Thêm bài hát vào Album')}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <div className={styles.body}>
                    {error && <div className={styles.error}>{error}</div>}

                    {loading ? (
                        <div className={styles.loading}>{t('loading', 'Đang tải...')}</div>
                    ) : songs.length === 0 ? (
                        <div className={styles.empty}>
                            <p>{t('no_songs_available', 'Không có bài hát nào khả dụng để thêm.')}</p>
                            <p className={styles.hint}>{t('upload_songs_hint', 'Hãy tải lên bài hát mới trước.')}</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.actions}>
                                <button type="button" onClick={handleSelectAll} className={styles.selectAllBtn}>
                                    {selectedSongs.length === songs.length ? t('deselect_all', 'Bỏ chọn tất cả') : t('select_all', 'Chọn tất cả')}
                                </button>
                                <span className={styles.selectedCount}>
                                    {t('selected_count', 'Đã chọn: {{count}}', { count: selectedSongs.length })}
                                </span>
                            </div>

                            <div className={styles.songList}>
                                {songs.map(song => (
                                    <div
                                        key={song._id}
                                        className={`${styles.songItem} ${selectedSongs.includes(song._id) ? styles.selected : ''}`}
                                        onClick={() => handleSelect(song._id)}
                                    >
                                        <div className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSongs.includes(song._id)}
                                                readOnly
                                            />
                                        </div>
                                        <div className={styles.songInfo}>
                                            <div className={styles.songTitle}>{song.title}</div>
                                            <div className={styles.songMeta}>
                                                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')} • {new Date(song.releaseDate).getFullYear()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.cancelButton} disabled={adding}>
                        {t('cancel', 'Hủy')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={styles.submitButton}
                        disabled={adding || selectedSongs.length === 0}
                    >
                        {adding ? t('adding', 'Đang thêm...') : t('add_selected', 'Thêm bài hát')}
                    </button>
                </div>
            </div>
        </div>
    );
}
