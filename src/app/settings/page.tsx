'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Settings.module.css';
import '../../services/i18n';
import api from '@/services/api';

const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
];


export default function SettingsPage() {
    const { t, i18n } = useTranslation('common');
    const router = useRouter();
    const { user, loading: authLoading, updateUser, refreshUser } = useAuth(); // Auth hook

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatar: null as string | null
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useState<HTMLInputElement | null>(null);

    // Pre-fill form
    useEffect(() => {
        if (user) {
            const u = user as any;
            setFormData(prev => ({
                ...prev,
                fullName: u.fullName || '',
                email: Array.isArray(u.email) ? u.email[0] : (u.email || ''),
                phone: u.phone || '',
                avatar: u.avatar || null
            }));
            if (u.avatar) {
                setPreviewUrl(u.avatar);
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

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
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);

            if (formData.newPassword) {
                formDataToSend.append('currentPassword', formData.currentPassword);
                formDataToSend.append('newPassword', formData.newPassword);
            }

            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            // Call API directly for now since we don't have userService file yet or it needs update
            const response = await api.put('/users/profile', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update Auth Context and LocalStorage with new user data
            if (updateUser) {
                updateUser(response.data);
            }

            setMessage({ type: 'success', text: t('profile_updated_successfully') });
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Remove page reload as context update is sufficient
            // setTimeout(() => window.location.reload(), 1000);

        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('update_failed')
            });
        } finally {
            setLoading(false);
        }
    };


    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'dark';
        }
        return 'dark';
    });

    const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        localStorage.setItem('language', langCode);
        setShowLanguageDropdown(false);
    };

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <button
                        className={styles.backButton}
                        onClick={() => router.push('/profile')}
                        title={t('back_to_profile', 'Back to Profile')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.957 2.793a1 1 0 010 1.414L8.164 12l7.793 7.793a1 1 0 11-1.414 1.414L5.336 12l9.207-9.207a1 1 0 011.414 0z" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>{t('settings_title')}</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Spotify Profile Header Style */}
                    <div className={styles.profileSection}>
                        <div className={styles.avatarWrapper}>
                            <img
                                src={previewUrl || '/default-avatar.png'}
                                alt="Avatar"
                                className={styles.avatarPreview}
                            />
                            <label htmlFor="avatar-upload" className={styles.avatarOverlay}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 3h-8v-2h8v2zm-16 21v-20h6v3h-3v14h12v-14h-3v-3h6v20h-18zm8-16h8v-3h-8v3zm-4 7h12v-3h-12v3zm0 5h12v-3h-12v3z" />
                                </svg>
                                <span>{t('change_photo', 'Change')}</span>
                            </label>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className={styles.hiddenInput}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className={styles.profileInfo}>
                            <div className={styles.profileLabel}>{t('profile', 'Profile')}</div>
                            <h1 className={styles.profileName}>{formData.fullName || 'User Name'}</h1>
                        </div>
                    </div>

                    {/* Edit Details Grid */}
                    <div className={styles.gridForm}>
                        <div className={styles.fullWidth}>
                            <h3 className={styles.sectionHeader}>{t('account_details', 'Account Details')}</h3>
                        </div>

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

                        <div className={styles.formGroup}>
                            <label htmlFor="email">{t('email')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>

                        {/* Empty div for grid alignment if needed, or allow full width below */}
                        <div></div>

                        <div className={styles.fullWidth}>
                            <h3 className={styles.sectionHeader}>{t('change_password', 'Change Password')}</h3>
                        </div>

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

                        <div></div> {/* Grid spacer */}

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

                        <div className={`${styles.fullWidth} ${styles.actions}`}>
                            {message.text && (
                                <div className={`${styles.message} ${styles[message.type]}`} style={{ marginRight: 'auto' }}>
                                    {message.text}
                                </div>
                            )}
                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={loading}
                            >
                                {loading ? t('saving') : t('save_changes')}
                            </button>
                        </div>
                    </div>
                </form>

                <div className={styles.divider} style={{ margin: '2rem 0' }}></div>
                {/* Language Setting */}
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingLabel}>{t('language_preference')}</h3>
                        <p className={styles.settingDescription}>{t('language_description')}</p>
                    </div>
                    <div className={styles.settingControl}>
                        <button
                            className={styles.dropdown}
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        >
                            <span>{currentLanguage.nativeName}</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4.427 6.427a.6.6 0 01.849 0L8 9.151l2.724-2.724a.6.6 0 11.849.849l-3.149 3.148a.6.6 0 01-.848 0L4.427 7.276a.6.6 0 010-.849z" />
                            </svg>
                        </button>

                        {showLanguageDropdown && (
                            <div className={styles.dropdownMenu}>
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        className={`${styles.dropdownItem} ${lang.code === i18n.language ? styles.active : ''}`}
                                        onClick={() => handleLanguageChange(lang.code)}
                                    >
                                        <span>{lang.nativeName}</span>
                                        {lang.code === i18n.language && (
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M13.985 2.383L5.127 12.754 1.388 8.375l-.658.77 4.397 5.149 9.618-11.262z" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.divider} style={{ margin: '2rem 0' }}></div>

                {/* Subscription Link */}
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingLabel}>{t('premium_status')}</h3>
                        <p className={styles.settingDescription}>{t('manage_subscription_desc', 'Manage your plan and billing details.')}</p>
                    </div>
                    <div className={styles.settingControl}>
                        <button
                            type="button"
                            className={styles.dropdown}
                            onClick={() => router.push('/premium')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            <span>{t('manage_subscription', 'Manage Subscription')}</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5.427 3.427a.6.6 0 01.849 0L10.151 8l-3.875 3.874a.6.6 0 11-.849-.849L8.452 8 5.427 4.276a.6.6 0 010-.849z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {/* Theme Setting */}
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <h3 className={styles.settingLabel}>{t('theme_preference')}</h3>
                        <p className={styles.settingDescription}>{t('theme_description')}</p>
                    </div>
                    <div className={styles.settingControl}>
                        <button
                            className={`${styles.toggle} ${theme === 'dark' ? styles.toggleActive : ''}`}
                            onClick={handleThemeToggle}
                            aria-label={t('toggle_theme')}
                        >
                            <span className={styles.toggleTrack}>
                                <span className={styles.toggleThumb}>
                                    {theme === 'dark' ? (
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z" />
                                        </svg>
                                    ) : (
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 11a3 3 0 110-6 3 3 0 010 6zm0 1a4 4 0 100-8 4 4 0 000 8zM8 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 0zm0 13a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 13zm8-5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5zM3 8a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-1.414 1.415a.5.5 0 11-.707-.708l1.414-1.414a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.05 13.657a.5.5 0 01-.707-.707l1.414-1.414a.5.5 0 01.707 0zm9.193 2.121a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 01.707-.707l1.414 1.414a.5.5 0 010 .707zM4.464 4.465a.5.5 0 01-.707 0L2.343 3.05a.5.5 0 11.707-.707l1.414 1.414a.5.5 0 010 .708z" />
                                        </svg>
                                    )}
                                </span>
                            </span>
                        </button>
                        <span className={styles.themeLabel}>
                            {theme === 'dark' ? t('dark_mode') : t('light_mode')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
