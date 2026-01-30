'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import albumService from '@/services/albumService';
import styles from './NewAlbum.module.css';

export default function NewAlbumPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        releaseDate: new Date().toISOString().split('T')[0]
    });
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('releaseDate', formData.releaseDate);
            if (coverImageFile) {
                data.append('coverImage', coverImageFile);
            }

            const newAlbum = await albumService.createAlbum(data);
            console.log('New album created:', newAlbum); // Debug log

            if (newAlbum && newAlbum._id) {
                router.push(`/albums/${newAlbum._id}`);
            } else {
                console.error('Album creation failed or returned invalid data:', newAlbum);
                setError('Failed to create album: No ID returned');
            }
        } catch (err: any) {
            console.error('Error creating album:', err);
            setError(err.response?.data?.message || 'Failed to create album');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1 className={styles.title}>{t('create_album', 'Tạo Album Mới')}</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">{t('album_title', 'Tên Album')}</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="Nhập tên album..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">{t('description', 'Mô tả')}</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Mô tả về album này..."
                            rows={4}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="coverImage">{t('cover_image', 'Ảnh bìa')}</label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                type="file"
                                id="coverImage"
                                name="coverImage"
                                onChange={handleFileChange}
                                accept="image/*"
                                className={styles.fileInput}
                            />
                            <div className={styles.fileInputButton}>
                                {coverImageFile ? 'Đổi ảnh khác' : 'Chọn ảnh bìa'}
                            </div>
                        </div>
                        {previewUrl && (
                            <div className={styles.previewWrapper}>
                                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                            </div>
                        )}
                        <p className={styles.hint}>* Định dạng hỗ trợ: JPG, PNG, JPEG</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="releaseDate">{t('release_date', 'Ngày phát hành')}</label>
                        <input
                            type="date"
                            id="releaseDate"
                            name="releaseDate"
                            value={formData.releaseDate}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className={styles.cancelButton}
                        >
                            {t('cancel', 'Hủy')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? t('creating', 'Đang tạo...') : t('create', 'Tạo Album')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
