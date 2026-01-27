'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import '../services/i18n'; // Init i18n
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, LanguageIcon } from '@heroicons/react/24/outline'; // Updated import path for v2

const Header = () => {
    const { t, i18n } = useTranslation('common');
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
        // Optional: Reload page to ensure all components update if deep nested
        // window.location.reload(); 
    };

    const languages = [
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>
                {t('app_title')}
            </Link>

            <div className={styles.actions}>
                {/* Language Switcher (Simple Select) */}
                <div className="flex items-center gap-2">
                    <LanguageIcon className="w-5 h-5 text-gray-500" />
                    <select
                        className={styles.languageSelect}
                        value={i18n.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                {user ? (
                    <div className={styles.userMenu} ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <img
                            src={user.avatar || "https://res.cloudinary.com/daz3r4rqn/image/upload/v1737960000/default-avatar_qjgxc9.png"}
                            alt="Avatar"
                            className={styles.avatar}
                        />
                        <span className={styles.username}>{user.fullName}</span>

                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                                    {t('welcome')}, {user.username}
                                </div>
                                <Link href="/profile" className={styles.dropdownItem}>
                                    <UserCircleIcon className="w-5 h-5" />
                                    {t('profile')}
                                </Link>
                                <Link href="/settings" className={styles.dropdownItem}>
                                    <Cog6ToothIcon className="w-5 h-5" />
                                    {t('settings')}
                                </Link>
                                <div className={styles.dropdownDivider}></div>
                                <button onClick={logout} className={`${styles.dropdownItem} text-red-500 hover:bg-red-50`}>
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    {t('logout')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.authButtons}>
                        <Link href="/login">
                            <button className={`${styles.btn} ${styles.btnLogin}`}>{t('login')}</button>
                        </Link>
                        <Link href="/register">
                            <button className={`${styles.btn} ${styles.btnRegister}`}>{t('register')}</button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
