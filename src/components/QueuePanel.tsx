'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useTranslation } from 'react-i18next';
import styles from './QueuePanel.module.css';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ isOpen, onClose }) => {
    const { queue, currentIndex, history, currentSong, playSong } = useMusicPlayer();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

    if (!isOpen) return null;

    // Get next 10 songs in queue
    const nextSongs = queue.slice(currentIndex + 1, currentIndex + 11);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'queue' ? styles.active : ''}`}
                        onClick={() => setActiveTab('queue')}
                    >
                        {t('queue_title', 'Queue')}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        {t('recently_played', 'Recently Played')}
                    </button>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'queue' ? (
                    <>
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>{t('now_playing', 'Now Playing')}</h3>
                            {currentSong && (
                                <div className={`${styles.songItem} ${styles.current}`}>
                                    <div className={styles.cover}>
                                        {currentSong.coverImage ? (
                                            <img src={currentSong.coverImage} alt={currentSong.title} />
                                        ) : (
                                            <div className={styles.coverPlaceholder}>🎵</div>
                                        )}
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.title}>{currentSong.title}</div>
                                        <div className={styles.artist}>
                                            {currentSong.artists?.map((a: any) => a.artistName).join(', ')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>{t('next_up', 'Next up')}</h3>
                            {nextSongs.length > 0 ? (
                                <div className={styles.list}>
                                    {nextSongs.map((song, idx) => (
                                        <div
                                            key={`${song._id}-${idx}`}
                                            className={styles.songItem}
                                            onClick={() => playSong(song)}
                                        >
                                            <div className={styles.cover}>
                                                {song.coverImage ? (
                                                    <img src={song.coverImage} alt={song.title} />
                                                ) : (
                                                    <div className={styles.coverPlaceholder}>🎵</div>
                                                )}
                                            </div>
                                            <div className={styles.info}>
                                                <div className={styles.title}>{song.title}</div>
                                                <div className={styles.artist}>
                                                    {song.artists?.map((a: any) => a.artistName).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.empty}>{t('no_next_songs', 'No next songs')}</p>
                            )}
                        </section>
                    </>
                ) : (
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t('recently_played', 'Recently Played')}</h3>
                        {history.length > 0 ? (
                            <div className={styles.list}>
                                {history.map((song, idx) => (
                                    <div
                                        key={`${song._id}-${idx}`}
                                        className={styles.songItem}
                                        onClick={() => playSong(song)}
                                    >
                                        <div className={styles.cover}>
                                            {song.coverImage ? (
                                                <img src={song.coverImage} alt={song.title} />
                                            ) : (
                                                <div className={styles.coverPlaceholder}>🎵</div>
                                            )}
                                        </div>
                                        <div className={styles.info}>
                                            <div className={styles.title}>{song.title}</div>
                                            <div className={styles.artist}>
                                                {song.artists?.map((a: any) => a.artistName).join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.empty}>{t('history_empty', 'History is empty')}</p>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default QueuePanel;
