'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import '../services/i18n'; // Init i18n
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { t, i18n } = useTranslation('common');
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        // Prevent scrolling when menu is open
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoAndToggle}>
                <Link href="/" className={styles.logo} onClick={() => { setIsMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}>
                    {t('app_title')}
                </Link>
                <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? (
                        <XMarkIcon className="w-6 h-6" />
                    ) : (
                        <Bars3Icon className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Desktop Actions */}
            <div className={`${styles.actions} ${styles.desktopOnly}`}>
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

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {user ? (
                            <>
                                <div className={styles.mobileUserInfo}>
                                    <div className={styles.avatarPlaceholder} style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                                        {user.avatar ? <img src={user.avatar} className={styles.avatar} style={{ width: '100%', height: '100%' }} /> : getInitials(user.fullName || user.username)}
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.fullName || user.username}</div>
                                </div>
                                <nav className={styles.mobileNav}>
                                    {user.role === 'admin' && (
                                        <Link href="/admin" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                                            {t('admin_dashboard')}
                                        </Link>
                                    )}
                                    <Link href="/profile" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                                        {t('profile')}
                                    </Link>
                                    <Link href="/settings" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                                        {t('settings')}
                                    </Link>
                                    <button onClick={() => { logout(); toggleMobileMenu(); }} className={`${styles.mobileNavLink} text-red-500`}>
                                        {t('logout')}
                                    </button>
                                </nav>
                            </>
                        ) : (
                            <div className={styles.mobileAuthButtons}>
                                <Link href="/login" onClick={toggleMobileMenu} style={{ width: '100%' }}>
                                    <button className={`${styles.btn} ${styles.btnLogin}`} style={{ width: '100%', border: '1px solid var(--foreground)' }}>{t('login')}</button>
                                </Link>
                                <Link href="/register" onClick={toggleMobileMenu} style={{ width: '100%' }}>
                                    <button className={`${styles.btn} ${styles.btnRegister}`} style={{ width: '100%' }}>{t('register')}</button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
