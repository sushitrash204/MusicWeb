'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AudioPreviewSelector from '@/components/AudioPreviewSelector';
import LyricsEditor from '@/components/LyricsEditor';
import ArtistSearchPicker from '@/components/ArtistSearchPicker';
import artistService from '@/services/artistService';
import api from '@/services/api';
import styles from './NewSong.module.css';

interface Artist {
    _id: string;
    artistName: string;
}

interface Genre {
    _id: string;
    name: string;
}

export default function NewSongPage() {
    const { t } = useTranslation('common');
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [myArtist, setMyArtist] = useState<Artist | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        lyrics: '',
        audioFile: null as File | null,
        coverFile: null as File | null,
        duration: 0,
        previewStart: 30,
        selectedArtists: [] as string[],
        selectedGenres: [] as string[],
        status: 'public' as 'draft' | 'public'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all data in parallel for faster loading
            const [artistsData, genresData, myArtistData] = await Promise.all([
                artistService.getArtists(),
                artistService.getGenres(),
                artistService.getMyArtistProfile().catch(() => null) // Don't fail if user has no artist profile
            ]);

            setArtists(artistsData);
            setGenres(genresData);

            // Auto-select user as default artist if they have one
            if (myArtistData && myArtistData._id) {
                setMyArtist(myArtistData);
                setFormData(prev => ({
                    ...prev,
                    selectedArtists: [myArtistData._id]
                }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.audioFile) {
            alert(t('select_audio_file', 'Please select an audio file'));
            return;
        }

        if (formData.selectedArtists.length === 0) {
            alert(t('select_at_least_one_artist', 'Please select at least 1 artist'));
            return;
        }

        setLoading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('title', formData.title);
            uploadData.append('lyrics', formData.lyrics);
            uploadData.append('duration', formData.duration.toString());
            uploadData.append('previewStart', formData.previewStart.toString());
            uploadData.append('audio', formData.audioFile);
            uploadData.append('status', formData.status);

            if (formData.coverFile) {
                uploadData.append('cover', formData.coverFile);
            }

            // Send arrays as JSON strings
            uploadData.append('artists', JSON.stringify(formData.selectedArtists));
            uploadData.append('genres', JSON.stringify(formData.selectedGenres));

            await artistService.createSong(uploadData);
            alert(t('upload_success', 'Song created successfully!'));
            router.push('/profile');
        } catch (error: any) {
            console.error('Failed to create song', error);
            alert(error.response?.data?.message || t('upload_failed', 'An error occurred. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const toggleGenre = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedGenres: prev.selectedGenres.includes(genreId)
                ? prev.selectedGenres.filter(id => id !== genreId)
                : [...prev.selectedGenres, genreId]
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ← {t('back', 'Back')}
                </button>
                <h1 className={styles.title}>{t('new_song_title', 'Add New Song')}</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Basic Info Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('basic_info', 'Basic Information')}</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('song_title', 'Song Title')} *</label>
                        <input
                            type="text"
                            required
                            className={styles.input}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('song_title_placeholder', 'Enter song title...')}
                        />
                    </div>
                </section>

                {/* Media Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('media', 'Media')}</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('audio_file', 'Audio File')} *</label>
                        <input
                            type="file"
                            required
                            accept="audio/*"
                            className={styles.fileInput}
                            onChange={e => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('cover_image', 'Cover Image')}</label>
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={e => setFormData({ ...formData, coverFile: e.target.files?.[0] || null })}
                        />
                    </div>
                </section>

                {/* Lyrics Section - Now BELOW Media section so we have audio for sync */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('lyrics', 'Lyrics')}</h2>
                    <div className={styles.formGroup}>
                        <LyricsEditor
                            value={formData.lyrics}
                            onChange={(newValue) => setFormData({ ...formData, lyrics: newValue })}
                            audioFile={formData.audioFile}
                        />
                    </div>
                </section>

                {/* Preview Selector */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('preview_section', 'Select Preview Segment (15s)')}</h2>
                    <AudioPreviewSelector
                        audioFile={formData.audioFile}
                        onPreviewStartChange={(seconds) => setFormData({ ...formData, previewStart: seconds })}
                        onDurationChange={(seconds) => setFormData({ ...formData, duration: seconds })}
                    />
                </section>

                {/* Artists Selection */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('artists_selection', 'Artists')} *</h2>
                    <ArtistSearchPicker
                        selectedArtists={formData.selectedArtists}
                        onChange={(artistIds) => setFormData({ ...formData, selectedArtists: artistIds })}
                        defaultArtist={myArtist}
                    />
                </section>

                {/* Genres Selection */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('genres_selection', 'Genres')}</h2>
                    <div className={styles.tagGrid}>
                        {genres.map(genre => (
                            <label key={genre._id} className={styles.tagLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.selectedGenres.includes(genre._id)}
                                    onChange={() => toggleGenre(genre._id)}
                                />
                                <span className={styles.tag}>
                                    {genre.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Status Selection */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('status', 'Status')}</h2>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="status"
                                checked={formData.status === 'public'}
                                onChange={() => setFormData({ ...formData, status: 'public' })}
                            />
                            <span>{t('status_public', 'Public')}</span>
                            <small>{t('status_public_desc', 'Everyone can listen now')}</small>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="status"
                                checked={formData.status === 'draft'}
                                onChange={() => setFormData({ ...formData, status: 'draft' })}
                            />
                            <span>{t('status_draft', 'Draft')}</span>
                            <small>{t('status_draft_desc', 'Only you can see')}</small>
                        </label>
                    </div>
                </section>

                {/* Submit Button */}
                <div className={styles.actions}>
                    {formData.audioFile && formData.duration === 0 && (
                        <div className={styles.analyzing}>
                            ⚠️ {t('analyzing_audio', 'Đang phân tích thời lượng file... Vui lòng đợi.')}
                        </div>
                    )}
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        {t('cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || (!!formData.audioFile && formData.duration === 0)}
                    >
                        {loading ? t('uploading', 'Uploading...') : t('create_song', 'Create Song')}
                    </button>
                </div>
            </form>
        </div>
    );
}
