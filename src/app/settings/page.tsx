'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import styles from './Settings.module.css';
import '../../services/i18n';

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
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.957 2.793a1 1 0 010 1.414L8.164 12l7.793 7.793a1 1 0 11-1.414 1.414L5.336 12l9.207-9.207a1 1 0 011.414 0z" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>{t('settings_title')}</h1>
                </div>

                {/* Settings Card */}
                <div className={styles.card}>
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
        </div>
    );
}
