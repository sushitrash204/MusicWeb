'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import '../services/i18n'; // Init i18n
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Updated import path for v2

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

    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>
                {t('app_title')}
            </Link>

            <div className={styles.actions}>


                {user ? (
                    <div className={styles.userMenu} ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {getInitials(user.fullName || user.username)}
                            </div>
                        )}
                        <span className={styles.username}>{user.fullName}</span>

                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                <div className="px-4 py-2 text-sm border-b" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                                    {t('welcome')}, {user.username}
                                </div>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className={styles.dropdownItem}>
                                        <div className="w-5 h-5 flex items-center justify-center font-bold">A</div>
                                        {t('admin_dashboard')}
                                    </Link>
                                )}
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
