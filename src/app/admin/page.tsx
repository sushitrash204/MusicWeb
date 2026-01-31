'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import adminService from '@/services/adminService';
import artistService from '@/services/artistService';
import styles from './Admin.module.css';
import '../../services/i18n';

export default function AdminDashboard() {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'requests' | 'genres'>('requests');
    const [requests, setRequests] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const [newGenre, setNewGenre] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initial Load & Auth Check
    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchData();
    }, [user, authLoading, activeTab, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'requests') {
                const data = await adminService.getAllPendingRequests();
                setRequests(data);
            } else {
                const data = await artistService.getGenres();
                setGenres(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await adminService.approveArtistRequest(id);
            setRequests(requests.filter(req => req._id !== id));
            setMessage({ type: 'success', text: t('request_approved') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('action_failed') });
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm(t('confirm_reject'))) return;
        try {
            await adminService.rejectArtistRequest(id);
            setRequests(requests.filter(req => req._id !== id));
            setMessage({ type: 'success', text: t('request_rejected') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('action_failed') });
        }
    };

    const handleAddGenre = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const addedGenre = await adminService.createGenre(newGenre.name, newGenre.description);
            setGenres([...genres, addedGenre]);
            setNewGenre({ name: '', description: '' });
            setMessage({ type: 'success', text: t('genre_added') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: t('action_failed') });
        }
    };

    if (authLoading || !user || user.role !== 'admin') {
        return <div className={styles.container}>{t('loading')}...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('admin_dashboard')}</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    {t('artist_requests')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'genres' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('genres')}
                >
                    {t('genre_management')}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    backgroundColor: message.type === 'success' ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#1DB954' : '#ef4444'
                }}>
                    {message.text}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className={styles.tableContainer}>
                    {loading ? (
                        <p>{t('loading')}...</p>
                    ) : requests.length === 0 ? (
                        <p>{t('no_pending_requests')}</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t('artist')}</th>
                                    <th className={styles.th}>{t('bio')}</th>
                                    <th className={styles.th}>{t('genres')}</th>
                                    <th className={styles.th}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req._id}>
                                        <td className={styles.td}>
                                            <div className="font-bold">{req.artistName}</div>
                                            <div className="text-sm text-gray-500">{req.userId?.fullName}</div>
                                        </td>
                                        <td className={styles.td}>{req.bio}</td>
                                        <td className={styles.td}>
                                            {(req.genres || []).map((g: any) => g.name).join(', ')}
                                        </td>
                                        <td className={styles.td}>
                                            <button
                                                className={`${styles.actionBtn} ${styles.approveBtn}`}
                                                onClick={() => handleApprove(req._id)}
                                            >
                                                {t('approve')}
                                            </button>
                                            <button
                                                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                onClick={() => handleReject(req._id)}
                                            >
                                                {t('reject')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'genres' && (
                <div>
                    <form onSubmit={handleAddGenre} className={styles.tableContainer} style={{ marginBottom: '2rem' }}>
                        <h2 className={styles.subtitle}>{t('add_genre')}</h2>
                        <div className={styles.formGroup}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder={t('genre_name')}
                                value={newGenre.name}
                                onChange={e => setNewGenre({ ...newGenre, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder={t('description')}
                                value={newGenre.description}
                                onChange={e => setNewGenre({ ...newGenre, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" className={`${styles.actionBtn} ${styles.approveBtn}`}>
                            {t('add')}
                        </button>
                    </form>

                    <div className={styles.genreList}>
                        {genres.map(genre => (
                            <span key={genre._id} className={styles.genreTag}>
                                {genre.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
