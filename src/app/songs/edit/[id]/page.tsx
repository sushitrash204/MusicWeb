'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import AudioPreviewSelector from '@/components/AudioPreviewSelector';
import artistService from '@/services/artistService';
import styles from '../../new/NewSong.module.css';

interface Artist {
    _id: string;
    artistName: string;
}

interface Genre {
    _id: string;
    name: string;
}

export default function EditSongPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        lyrics: '',
        audioFile: null as File | null,
        coverFile: null as File | null,
        duration: 0,
        previewStart: 30,
        selectedArtists: [] as string[],
        selectedGenres: [] as string[],
        status: 'public' as 'draft' | 'public',
        existingAudioUrl: '',
        existingCoverImage: ''
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [artistsData, genresData, songData] = await Promise.all([
                artistService.getArtists(),
                artistService.getGenres(),
                artistService.getSongById(id as string)
            ]);

            setArtists(artistsData);
            setGenres(genresData);

            if (songData) {
                setFormData({
                    title: songData.title || '',
                    lyrics: songData.lyrics || '',
                    audioFile: null,
                    coverFile: null,
                    duration: songData.duration || 0,
                    previewStart: songData.previewStart || 30,
                    selectedArtists: songData.artists?.map((a: any) => a._id) || [],
                    selectedGenres: songData.genres?.map((g: any) => g._id) || [],
                    status: songData.status || 'public',
                    existingAudioUrl: songData.audioUrl || '',
                    existingCoverImage: songData.coverImage || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.selectedArtists.length === 0) {
            alert(t('select_at_least_one_artist', 'Please select at least 1 artist'));
            return;
        }

        setSubmitting(true);
        try {
            const uploadData = new FormData();
            uploadData.append('title', formData.title);
            uploadData.append('lyrics', formData.lyrics);
            uploadData.append('duration', formData.duration.toString());
            uploadData.append('previewStart', formData.previewStart.toString());
            uploadData.append('status', formData.status);

            if (formData.audioFile) {
                uploadData.append('audio', formData.audioFile);
            }

            if (formData.coverFile) {
                uploadData.append('cover', formData.coverFile);
            }

            uploadData.append('artists', JSON.stringify(formData.selectedArtists));
            uploadData.append('genres', JSON.stringify(formData.selectedGenres));

            await artistService.updateSong(id as string, uploadData);
            alert(t('update_success', 'Song updated successfully!'));
            router.push('/profile');
        } catch (error: any) {
            console.error('Failed to update song', error);
            alert(error.response?.data?.message || t('update_failed', 'An error occurred. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleArtist = (artistId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedArtists: prev.selectedArtists.includes(artistId)
                ? prev.selectedArtists.filter(id => id !== artistId)
                : [...prev.selectedArtists, artistId]
        }));
    };

    const toggleGenre = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedGenres: prev.selectedGenres.includes(genreId)
                ? prev.selectedGenres.filter(id => id !== genreId)
                : [...prev.selectedGenres, genreId]
        }));
    };

    if (loading) return <div className={styles.container}>{t('loading')}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ← {t('back', 'Back')}
                </button>
                <h1 className={styles.title}>{t('edit_song_title', 'Edit Song')}</h1>
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
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('lyrics', 'Lyrics')} ({t('optional', 'Optional')})</label>
                        <textarea
                            className={styles.textarea}
                            rows={6}
                            value={formData.lyrics}
                            onChange={e => setFormData({ ...formData, lyrics: e.target.value })}
                        />
                    </div>
                </section>

                {/* Media Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('media', 'Media')}</h2>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('audio_file', 'Audio File')} ({t('audio_file_formats', 'MP3, WAV')})</label>
                        {formData.existingAudioUrl && !formData.audioFile && (
                            <div className="mb-2 text-sm text-green-500">✓ {t('audio_already_uploaded', 'Audio file already exists')}</div>
                        )}
                        <input
                            type="file"
                            accept="audio/*"
                            className={styles.fileInput}
                            onChange={e => setFormData({ ...formData, audioFile: e.target.files?.[0] || null })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('cover_image', 'Cover Image')} ({t('optional', 'Optional')})</label>
                        {formData.existingCoverImage && (
                            <div className="mb-2">
                                <img src={formData.existingCoverImage} alt="Current cover" className="w-24 h-24 object-cover rounded" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={e => setFormData({ ...formData, coverFile: e.target.files?.[0] || null })}
                        />
                    </div>
                </section>

                {/* Preview Selector */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('preview_section', 'Select Preview Segment (15s)')}</h2>
                    <AudioPreviewSelector
                        audioFile={formData.audioFile}
                        existingAudioUrl={formData.existingAudioUrl}
                        initialPreviewStart={formData.previewStart}
                        onPreviewStartChange={(seconds) => setFormData({ ...formData, previewStart: seconds })}
                        onDurationChange={(seconds) => setFormData({ ...formData, duration: seconds })}
                    />
                </section>

                {/* Artists Selection */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('artists_selection', 'Artists')} *</h2>
                    <div className={styles.tagGrid}>
                        {artists.map(artist => (
                            <label key={artist._id} className={styles.tagLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.selectedArtists.includes(artist._id)}
                                    onChange={() => toggleArtist(artist._id)}
                                />
                                <span className={styles.tag}>
                                    {artist.artistName}
                                </span>
                            </label>
                        ))}
                    </div>
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
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="status"
                                checked={formData.status === 'draft'}
                                onChange={() => setFormData({ ...formData, status: 'draft' })}
                            />
                            <span>{t('status_draft', 'Draft')}</span>
                        </label>
                    </div>
                </section>

                {/* Submit Button */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => router.back()}
                        disabled={submitting}
                    >
                        {t('cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={submitting}
                    >
                        {submitting ? t('updating', 'Updating...') : t('update_song', 'Update Song')}
                    </button>
                </div>
            </form>
        </div>
    );
}
