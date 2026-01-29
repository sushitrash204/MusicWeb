'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AudioPreviewSelector.module.css';

interface AudioPreviewSelectorProps {
    audioFile: File | null;
    existingAudioUrl?: string;
    initialPreviewStart?: number;
    onPreviewStartChange: (seconds: number) => void;
    onDurationChange: (seconds: number) => void;
}

const AudioPreviewSelector: React.FC<AudioPreviewSelectorProps> = ({
    audioFile,
    existingAudioUrl,
    initialPreviewStart = 30,
    onPreviewStartChange,
    onDurationChange
}) => {
    const { t } = useTranslation('common');
    const audioRef = useRef<HTMLAudioElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [previewStart, setPreviewStart] = useState(initialPreviewStart);
    const [isDragging, setIsDragging] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string>(existingAudioUrl || '');

    useEffect(() => {
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            setAudioUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (existingAudioUrl) {
            setAudioUrl(existingAudioUrl);
        }
    }, [audioFile, existingAudioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            const dur = Math.floor(audio.duration);
            setDuration(dur);
            onDurationChange(dur);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl, onDurationChange]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || duration === 0) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const handlePreviewDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || duration === 0) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newStart = Math.floor(percentage * duration);

        // Ensure preview doesn't go beyond duration - 15s
        const maxStart = Math.max(0, duration - 15);
        const finalStart = Math.min(newStart, maxStart);

        setPreviewStart(finalStart);
        onPreviewStartChange(finalStart);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        handlePreviewDrag(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            handlePreviewDrag(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!audioFile && !existingAudioUrl) {
        return (
            <div className={styles.placeholder}>
                <p>{t('upload_audio_preview', 'Upload audio to preview')}</p>
            </div>
        );
    }

    const previewPercentage = duration > 0 ? (previewStart / duration) * 100 : 0;
    const previewWidth = duration > 0 ? (15 / duration) * 100 : 0;
    const currentPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={styles.container}>
            <audio ref={audioRef} src={audioUrl} />

            {/* Player Controls */}
            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.playButton}
                    onClick={togglePlay}
                    disabled={!audioUrl}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <div className={styles.timeInfo}>
                    <span>{formatTime(currentTime)}</span>
                    <span className={styles.separator}>/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={timelineRef}
                className={styles.timeline}
                onClick={handleTimelineClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Progress bar */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progress}
                        style={{ width: `${currentPercentage}%` }}
                    />
                </div>

                {/* Preview window (15s) - CapCut style */}
                <div
                    className={styles.previewWindow}
                    style={{
                        left: `${previewPercentage}%`,
                        width: `${previewWidth}%`
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <div className={styles.previewHandle} />
                    <div className={styles.previewLabel}>
                        Preview: {formatTime(previewStart)} - {formatTime(previewStart + 15)}
                    </div>
                </div>
            </div>

            <div className={styles.hint}>
                💡 {t('preview_hint', 'Drag the green window to select a 15s preview segment')}
            </div>
        </div>
    );
};

export default AudioPreviewSelector;
