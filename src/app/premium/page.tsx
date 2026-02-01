'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import styles from './Premium.module.css';
import '../../services/i18n';
import PremiumModal from '@/components/PremiumModal';

export default function PremiumPage() {
    const { t, i18n } = useTranslation('common');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>{t('loading')}</div>
            </div>
        );
    }

    const isPremium = user.isPremium;
    const expiryDate = user.premiumExpiryDate
        ? new Date(user.premiumExpiryDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    const features = [
        t('ad_free_music'),
        t('high_quality_audio'),
        t('unlimited_skips'),
        t('offline_listening', 'Download & listen offline') // In case translation missing
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button
                    className={styles.backLink}
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0, marginBottom: '1rem' }}
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>{t('back')}</span>
                </button>
                <h1 className={styles.title}>{t('premium_page_title')}</h1>
                <p className={styles.subtitle}>{t('premium_page_subtitle')}</p>
            </div>

            <div className={`${styles.card} ${!isPremium ? styles.freeCard : ''}`}>
                <div className={styles.statusHeader}>
                    <span className={`${styles.statusLabel} ${!isPremium ? styles.freeLabel : ''}`}>
                        {t('your_plan')}
                    </span>
                    {isPremium && (
                        <div className={styles.expiryInfo}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{t('premium_expires')}: <span className={styles.expiryDate}>{expiryDate}</span></span>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className={styles.planName}>
                        {isPremium ? t('premium_plan', 'Premium Individual') : t('free_plan')}
                    </h2>

                    <div className={styles.featuresList}>
                        {features.map((feature, index) => (
                            <div key={index} className={styles.featureItem}>
                                <CheckIcon className={styles.checkIcon} />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actionSection}>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => setIsModalOpen(true)}
                    >
                        {isPremium ? t('premium_extend') : t('get_premium')}
                    </button>
                    <p className={styles.priceInfo}>
                        {t('premium_price_hint')}
                    </p>
                </div>
            </div>

            <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
