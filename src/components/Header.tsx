'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import '../services/i18n'; // Init i18n
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, PlusIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import searchService, { SearchResults } from '../services/searchService';
import PremiumModal from './PremiumModal';

const Header = () => {
    const { t, i18n } = useTranslation('common');
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search Logic
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Load history
    useEffect(() => {
        const history = localStorage.getItem('searchHistory');
        if (history) setSearchHistory(JSON.parse(history));
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true);
                try {
                    const data = await searchService.search(query);
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults(null);
                setShowResults(query.length > 0);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addToHistory = (term: string) => {
        const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    const removeFromHistory = (term: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newHistory = searchHistory.filter(item => item !== term);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    const handleItemClick = (type: string, id: string, term: string) => {
        addToHistory(term);
        setShowResults(false);
        setQuery('');
        router.push(`/${type}/${id}`);
    };

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

    const handlePremiumClick = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsPremiumModalOpen(true);
    };

    const hasResults = results && (
        results.songs.length > 0 ||
        results.albums.length > 0 ||
        results.artists.length > 0 ||
        results.playlists.length > 0
    );

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Link href="/" className={styles.logo} onClick={() => { setIsMobileMenuOpen(false); document.body.style.overflow = 'auto'; }}>
                    {t('app_title')}
                </Link>
            </div>

            <div className={styles.centerSection}>
                <div className={styles.searchContainer} ref={searchRef}>
                    <div className={styles.searchWrapper}>
                        <MagnifyingGlassIcon className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder', 'Tìm kiếm bài hát, nghệ sĩ...')}
                            className={styles.searchInput}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                        />
                    </div>

                    {showResults && (
                        <div className={styles.searchResults}>
                            {!query && searchHistory.length > 0 && (
                                <div className={styles.searchSection}>
                                    <div className={styles.historyHeader}>
                                        <span className={styles.sectionHeader}>{t('recent_searches', 'Tìm kiếm gần đây')}</span>
                                        <button className={styles.clearHistory} onClick={clearHistory}>{t('clear_all', 'Xóa tất cả')}</button>
                                    </div>
                                    {searchHistory.map(term => (
                                        <div key={term} className={`${styles.searchItem} ${styles.historyItem}`} onClick={() => setQuery(term)}>
                                            <div className={styles.itemName}>{term}</div>
                                            <button className={styles.removeHistory} onClick={(e) => removeFromHistory(term, e)}>
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {query && isSearching && <div className={styles.noResults}>{t('searching', 'Đang tìm kiếm...')}</div>}

                            {query && !isSearching && !hasResults && <div className={styles.noResults}>{t('no_results_found', 'Không tìm thấy kết quả')}</div>}

                            {(results?.artists?.length ?? 0) > 0 && (
                                <div className={styles.searchSection}>
                                    <div className={styles.sectionHeader}>{t('artists')}</div>
                                    {results?.artists.map(artist => (
                                        <div key={artist._id} className={styles.searchItem} onClick={() => handleItemClick('artist', artist._id, artist.artistName)}>
                                            <img src={artist.userId?.avatar || '/default-avatar.png'} className={styles.itemImageCircle} alt="" />
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemName}>{artist.artistName}</div>
                                                <div className={styles.itemMeta}>{t('artist')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(results?.songs?.length ?? 0) > 0 && (
                                <div className={styles.searchSection}>
                                    <div className={styles.sectionHeader}>{t('songs')}</div>
                                    {results?.songs.map(song => (
                                        <div key={song._id} className={styles.searchItem} onClick={() => handleItemClick('song', song._id, song.title)}>
                                            <img src={song.coverImage || '/default-song.png'} className={styles.itemImage} alt="" />
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemName}>{song.title}</div>
                                                <div className={styles.itemMeta}>{song.artists.map((a: any) => a.artistName).join(', ')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(results?.albums?.length ?? 0) > 0 && (
                                <div className={styles.searchSection}>
                                    <div className={styles.sectionHeader}>{t('albums')}</div>
                                    {results?.albums.map(album => (
                                        <div key={album._id} className={styles.searchItem} onClick={() => handleItemClick('albums', album._id, album.title)}>
                                            <img src={album.coverImage || '/default-album.png'} className={styles.itemImage} alt="" />
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemName}>{album.title}</div>
                                                <div className={styles.itemMeta}>{album.artist?.artistName || t('unknown_artist')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(results?.playlists?.length ?? 0) > 0 && (
                                <div className={styles.searchSection}>
                                    <div className={styles.sectionHeader}>{t('playlists', 'Danh sách phát')}</div>
                                    {results?.playlists.map(playlist => (
                                        <div key={playlist._id} className={styles.searchItem} onClick={() => handleItemClick('playlists', playlist._id, playlist.title)}>
                                            <img src={playlist.coverImage || '/default-playlist.png'} className={styles.itemImage} alt="" />
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemName}>{playlist.title}</div>
                                                <div className={styles.itemMeta}>{playlist.owner?.fullName || t('unknown_user')}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* Desktop Actions */}
                <div className={`${styles.actions} ${styles.desktopOnly}`}>
                    {(!user || !user.isPremium) && (
                        <button className={styles.premiumBtn} onClick={handlePremiumClick}>
                            {t('get_premium')}
                        </button>
                    )}
                    {user ? (
                        <>
                            <div className={styles.userMenu} ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Avatar"
                                        className={styles.avatar}
                                        onError={(e) => {
                                            e.currentTarget.src = '/default-avatar.png';
                                            e.currentTarget.onerror = null; // Prevent loop
                                        }}
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
                                        <Link href="/playlists" className={styles.dropdownItem}>
                                            <PlusIcon className="w-5 h-5" />
                                            {t('my_playlists')}
                                        </Link>
                                        <Link href="/favorites" className={styles.dropdownItem}>
                                            <HeartIcon className="w-5 h-5" />
                                            {t('favorites')}
                                        </Link>
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
                        </>
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

                <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? (
                        <XMarkIcon className="w-6 h-6" />
                    ) : (
                        <Bars3Icon className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuContent}>
                        {user ? (
                            <>
                                <div className={styles.mobileUserInfo}>
                                    <div className={styles.avatarPlaceholder} style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                className={styles.avatar}
                                                style={{ width: '100%', height: '100%' }}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/default-avatar.png';
                                                    e.currentTarget.onerror = null;
                                                }}
                                            />
                                        ) : getInitials(user.fullName || user.username)}
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.fullName || user.username}</div>
                                </div>
                                {!user.isPremium && (
                                    <button
                                        className={styles.premiumBtnMobile}
                                        onClick={() => {
                                            toggleMobileMenu();
                                            handlePremiumClick();
                                        }}
                                    >
                                        {t('get_premium')}
                                    </button>
                                )}
                                <nav className={styles.mobileNav}>
                                    <Link href="/playlists" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                                        {t('my_playlists')}
                                    </Link>
                                    <Link href="/favorites" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                                        {t('favorites')}
                                    </Link>
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

            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
        </header>
    );
};

export default Header;
