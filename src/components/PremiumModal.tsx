import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import styles from './PremiumModal.module.css';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// CONFIGURATION - CHANGE THESE TO YOUR SEPAY/BANK INFO
const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '103877409967';
const BANK_NAME = process.env.NEXT_PUBLIC_BANK_NAME || 'VietinBank';
const AMOUNT = Number(process.env.NEXT_PUBLIC_PAYMENT_AMOUNT) || 5000;

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { t } = useTranslation('common');
    const { user, refreshUser } = useAuth();
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isOpen && user && !user.isPremium) {
            // Start polling every 5 seconds
            interval = setInterval(async () => {
                setIsChecking(true);
                await refreshUser();
                setIsChecking(false);
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, user?.isPremium, refreshUser]);

    if (!isOpen || !user) return null;

    // Create unique transfer content: SEVQR TKPACB MUSA <UserId>
    // SePay VA requirement: Must start with SEVQR and contain TKPACB
    // We append MUSA <UserId> for our backend to identify the user.
    const transferContent = `SEVQR TKPACB MUSA ${user._id}`;

    // Construct QR URL
    // https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_NAME}&amount=${AMOUNT}&des=${encodeURIComponent(transferContent)}`;

    const isSuccess = user.isPremium;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className={styles.title}>
                    {isSuccess ? t('premium_success_title') : t('premium_unlock_title')}
                </h2>

                {isSuccess ? (
                    <div className={styles.successContainer}>
                        <CheckCircleIcon className={styles.successIcon} />
                        <p className={styles.successMessage}>
                            {t('premium_success_message')}
                        </p>
                        <button className={styles.doneButton} onClick={onClose}>
                            {t('premium_done')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.qrContainer}>
                            <img
                                src={qrUrl}
                                alt="Payment QR Code"
                                className={styles.qrImage}
                            />
                            {isChecking && <div className={styles.checkingOverlay}>{t('premium_checking')}</div>}
                        </div>

                        <div className={styles.infoContainer}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>{t('premium_amount')}:</span>
                                <span className={`${styles.value} ${styles.highlight}`}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(AMOUNT)}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>{t('premium_content')}:</span>
                                <span className={`${styles.value} ${styles.highlight}`}>{transferContent}</span>
                            </div>
                        </div>

                        <p className={styles.instructions}>
                            {t('premium_instructions')}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
