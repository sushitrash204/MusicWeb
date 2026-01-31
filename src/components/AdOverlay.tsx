'use client';

import React, { useState, useEffect } from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './AdOverlay.module.css';

const AdOverlay = () => {
    const { showAd, finishAd } = useMusicPlayer();
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        if (showAd) {
            setSecondsLeft(5); // Reset timer when ad shows
            const interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showAd]);

    if (!showAd) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.title}>Advertisement</span>
                    {secondsLeft > 0 ? (
                        <span className={styles.timer}>Skip in {secondsLeft}s</span>
                    ) : (
                        <button className={styles.closeButton} onClick={finishAd}>
                            Skip <XMarkIcon className="w-5 h-5 inline" />
                        </button>
                    )}
                </div>

                <div className={styles.adContent}>
                    <div id="frame" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
                        <iframe
                            data-aa='2426079'
                            src='//acceptable.a-ads.com/2426079/?size=Adaptive'
                            style={{
                                border: 0,
                                padding: 0,
                                width: '100%',
                                height: '250px', // Standard adaptive height or adjust as needed
                                overflow: 'hidden',
                                display: 'block',
                                margin: 'auto',
                                backgroundColor: '#2a2a2a'
                            }}
                            title="Advertisement"
                        ></iframe>
                    </div>
                </div>

                <div className={styles.footer}>
                    Thank you for supporting our platform!
                </div>
            </div>
        </div>
    );
};

export default AdOverlay;
