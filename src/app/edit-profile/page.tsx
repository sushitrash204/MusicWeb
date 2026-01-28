'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './EditProfile.module.css';
import '../../services/i18n';

export default function EditProfilePage() {
    const { t } = useTranslation('common');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (authLoading) return;

        if (!user && !localStorage.getItem('accessToken')) {
            router.push('/login');
            return;
        }

        // Pre-fill form with user data
        if (user) {
            const u = user as any;
            setFormData(prev => ({
                ...prev,
                fullName: u.fullName || '',
                email: Array.isArray(u.email) ? u.email[0] : (u.email || ''),
                phone: u.phone || ''
            }));
        }
    }, [user, authLoading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validate password fields if user wants to change password
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: t('passwords_do_not_match') });
                setLoading(false);
                return;
            }
            if (!formData.currentPassword) {
                setMessage({ type: 'error', text: t('current_password_required') });
                setLoading(false);
                return;
            }
        }

        try {
            // TODO: Implement API call to update user profile
            // await userService.updateProfile(formData);

            setMessage({ type: 'success', text: t('profile_updated_successfully') });

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('update_failed')
            });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>{t('loading')}...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <button
                        className={styles.backButton}
                        onClick={() => router.push('/profile')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.957 2.793a1 1 0 010 1.414L8.164 12l7.793 7.793a1 1 0 11-1.414 1.414L5.336 12l9.207-9.207a1 1 0 011.414 0z" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>{t('edit_profile_page_title')}</h1>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Profile Information */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('profile_information')}</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">{t('full_name')}</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">{t('email')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">{t('phone_number')}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder={t('optional')}
                            />
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>{t('change_password')}</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword">{t('current_password')}</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword">{t('new_password')}</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">{t('confirm_password')}</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => router.push('/profile')}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={loading}
                        >
                            {loading ? t('saving') : t('save_changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
