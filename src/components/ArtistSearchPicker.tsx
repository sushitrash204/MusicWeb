'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import searchService from '@/services/searchService';
import styles from './ArtistSearchPicker.module.css';

interface Artist {
    _id: string;
    artistName: string;
    userId?: {
        avatar?: string;
    };
}

interface ArtistSearchPickerProps {
    selectedArtists: string[];
    onChange: (artistIds: string[]) => void;
    defaultArtist?: Artist | null;
}

export default function ArtistSearchPicker({ selectedArtists, onChange, defaultArtist }: ArtistSearchPickerProps) {
    const { t } = useTranslation('common');
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Artist[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [artistDetails, setArtistDetails] = useState<Map<string, Artist>>(new Map());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchService.search(query);
                setSearchResults(results.artists || []);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectArtist = (artist: Artist) => {
        if (!selectedArtists.includes(artist._id)) {
            onChange([...selectedArtists, artist._id]);
            // Store artist details for display
            setArtistDetails(prev => new Map(prev).set(artist._id, artist));
        }
        setQuery('');
        setShowDropdown(false);
    };

    const handleRemoveArtist = (artistId: string) => {
        // Don't allow removing default artist
        if (artistId === defaultArtist?._id) return;
        onChange(selectedArtists.filter(id => id !== artistId));
    };

    // Store artist details when they appear in search results
    useEffect(() => {
        searchResults.forEach(artist => {
            setArtistDetails(prev => new Map(prev).set(artist._id, artist));
        });
    }, [searchResults]);

    // Store default artist details immediately
    useEffect(() => {
        if (defaultArtist) {
            setArtistDetails(prev => new Map(prev).set(defaultArtist._id, defaultArtist));
        }
    }, [defaultArtist]);

    return (
        <div className={styles.container}>
            <div className={styles.searchWrapper} ref={dropdownRef}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={t('search_artists')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowDropdown(true)}
                />

                {showDropdown && (
                    <div className={styles.dropdown}>
                        {isSearching && (
                            <div className={styles.searchingText}>
                                {t('searching')}
                            </div>
                        )}

                        {!isSearching && searchResults.length === 0 && (
                            <div className={styles.noResults}>
                                {t('no_results_found')}
                            </div>
                        )}

                        {!isSearching && searchResults.map(artist => (
                            <div
                                key={artist._id}
                                className={`${styles.artistItem} ${selectedArtists.includes(artist._id) ? styles.selected : ''}`}
                                onClick={() => handleSelectArtist(artist)}
                            >
                                <img
                                    src={artist.userId?.avatar || '/default-avatar.png'}
                                    alt=""
                                    className={styles.artistAvatar}
                                />
                                <div className={styles.artistInfo}>
                                    <div className={styles.artistName}>{artist.artistName}</div>
                                    {selectedArtists.includes(artist._id) && (
                                        <span className={styles.selectedBadge}>✓ {t('selected')}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedArtists.length > 0 && (
                <div className={styles.selectedSection}>
                    <div className={styles.selectedLabel}>
                        {t('selected_artists')} ({selectedArtists.length})
                    </div>
                    <div className={styles.chipsContainer}>
                        {selectedArtists.map(artistId => {
                            const artist = artistDetails.get(artistId);
                            const isDefault = artistId === defaultArtist?._id;

                            return (
                                <div
                                    key={artistId}
                                    className={`${styles.chip} ${isDefault ? styles.chipDefault : styles.chipRemovable}`}
                                >
                                    <span className={styles.chipText}>
                                        {artist?.artistName || 'Loading...'}
                                    </span>
                                    {!isDefault && (
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => handleRemoveArtist(artistId)}
                                            title={t('remove_artist')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
