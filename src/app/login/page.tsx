'use client';

import { useState, useEffect } from 'react';
import authService from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // Import i18n
import { useAlert } from '@/context/AlertContext';
import '../../services/i18n'; // Ensure i18n is initialized
import styles from './AuthPage.module.css';

export default function AuthPage() {
    const { t } = useTranslation('common'); // Init i18n hook with namespace
    const { login, register, user, loading: authLoading } = useAuth(); // Get user and global loading
    const { showAlert } = useAlert();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false); // Local form loading
    const [error, setError] = useState('');
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phoneNumber: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login({ username: formData.username, password: formData.password });
                router.push('/');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error(t('password_mismatch'));
                }

                await authService.register({
                    fullName: formData.fullName,
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber
                });

                alert(t('register_success_alert'));
                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || t('RATE_LIMIT_GLOBAL'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>
                        {isLogin ? t('login_title') : t('register_title')}
                    </h1>

                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tabButton} ${isLogin ? styles.activeTab : ''}`}
                            onClick={() => { setIsLogin(true); setError(''); }}
                        >
                            {t('login')}
                        </button>
                        <button
                            className={`${styles.tabButton} ${!isLogin ? styles.activeTab : ''}`}
                            onClick={() => { setIsLogin(false); setError(''); }}
                        >
                            {t('register')}
                        </button>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>

                        {!isLogin && (
                            <div className={styles.animationContainer}>
                                <div>
                                    <label className={styles.label}>{t('full_name')}</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required={!isLogin}
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder={t('full_name')}
                                    />
                                </div>
                                <div>
                                    <label className={styles.label}>{t('email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required={!isLogin}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={styles.label}>{t('username')}</label>
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="username123"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>{t('password')}</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="••••••••"
                            />
                        </div>

                        {!isLogin && (
                            <div className={styles.animationContainer}>
                                <label className={styles.label}>{t('confirm_password')}</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required={!isLogin}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? t('processing') : (isLogin ? t('login') : t('register'))}
                        </button>
                    </form>

                    <p className={styles.footer}>
                        {isLogin ? t('no_account') + ' ' : t('has_account') + ' '}
                        <button
                            className={styles.linkButton}
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? t('register_now') : t('login_now')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
