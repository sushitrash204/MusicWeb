'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import artistService from '@/services/artistService';
import Header from '@/components/Header';
import styles from './ArtistRequest.module.css';
import '../../services/i18n'; // Ensure i18n init



export default function ArtistRequestPage() {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [artistName, setArtistName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    useEffect(() => {
        if (authLoading) return; // Wait for auth check

        if (!user && !localStorage.getItem('accessToken')) {
            router.push('/login');
            return;
        }
    }, [user, router, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!artistName.trim()) {
            setMessage({ type: 'error', text: t('req_artist_name_required') });
            return;
        }

        // Token is handled by api interceptor from localStorage

        setLoading(true);
        try {
            await artistService.submitArtistRequest({
                artistName,
                bio
            });

            setMessage({ type: 'success', text: t('request_success') });
            // Optionally redirect after a few seconds
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Something went wrong'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>{t('artist_request_title')}</h1>

                {message && (
                    <div className={message.type === 'success' ? styles.success : styles.error} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '4px', backgroundColor: message.type === 'success' ? 'rgba(29, 185, 84, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('artist_name')}</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={artistName}
                            onChange={(e) => setArtistName(e.target.value)}
                            placeholder={t('artist_name')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('artist_bio')}</label>
                        <textarea
                            className={styles.textarea}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder={t('artist_bio_placeholder')}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? '...' : t('submit_request')}
                    </button>
                </form>
            </div>
        </div>
    );
}
