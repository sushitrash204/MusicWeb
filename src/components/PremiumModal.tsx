import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext'; // Verify path
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
    const { user } = useAuth();

    if (!isOpen || !user) return null;

    // Create unique transfer content: SEVQR TKPACB MUSA <UserId>
    // SePay VA requirement: Must start with SEVQR and contain TKPACB
    // We append MUSA <UserId> for our backend to identify the user.
    const transferContent = `SEVQR TKPACB MUSA ${user._id}`;

    // Construct QR URL
    // https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_NAME}&amount=${AMOUNT}&des=${encodeURIComponent(transferContent)}`;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <h2 className={styles.title}>Unlock Premium</h2>

                <div className={styles.qrContainer}>
                    <img
                        src={qrUrl}
                        alt="Payment QR Code"
                        className={styles.qrImage}
                    />
                </div>

                <div className={styles.infoContainer}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Amount:</span>
                        <span className={`${styles.value} ${styles.highlight}`}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(AMOUNT)}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Content:</span>
                        <span className={`${styles.value} ${styles.highlight}`}>{transferContent}</span>
                    </div>
                </div>

                <p className={styles.instructions}>
                    Scan the QR code with your banking app.<br />
                    The premium status will be activated automatically<br />
                    within 1-2 minutes after payment.
                </p>
            </div>
        </div>
    );
}
