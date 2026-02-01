import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notificationService';
import styles from './Header.module.css';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import artistService from '../services/artistService';

interface NotificationProps {
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationProps> = ({ onClose }) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { playList } = useMusicPlayer();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications({ limit: 10 });
            setNotifications(data.notifications);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        // Mark as read immediately
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification._id);
                setNotifications(notifications.map(n =>
                    n._id === notification._id ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error(error);
            }
        }

        // Navigate based on type
        const { type, data } = notification;

        if (type === 'SONG_MILESTONE' || type === 'NEW_POST') {
            if (data.song_id) {
                // Determine if we should play it or go to page
                // User requirement: "người dùng bấm vào thông báo thì nghe được luôn bài hát đó"
                // Let's try to play it. We need song details.
                try {
                    // Fetch song details first
                    const songDetails = await artistService.getSongById(data.song_id);
                    if (songDetails) {
                        playList([songDetails]);
                    } else {
                        // Fallback to song page if exists, or do nothing
                    }
                } catch (e) {
                    console.error("Could not fetch song to play", e);
                }
            } else if (data.artist_id) {
                router.push(`/artist/${data.artist_id}`);
            }
        } else if (type === 'PAYMENT') {
            router.push('/settings'); // Or payment history
        }

        onClose();
    };

    return (
        <div className={styles.notificationDropdown}>
            <div className={styles.notificationHeader}>
                <h3>{t('notifications')}</h3>
                <div className={styles.headerActions}>
                    <button className={styles.markReadBtn} onClick={handleMarkAllRead}>
                        {t('mark_all_read')}
                    </button>
                </div>
            </div>
            <div className={styles.notificationList}>
                {loading ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('loading')}...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('no_notifications')}
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <img
                                src={notification.data.cover_image || notification.data.avatar || '/default-song.png'}
                                alt=""
                                className={styles.notifImage}
                                onError={(e) => { e.currentTarget.src = '/default-song.png'; }}
                            />
                            <div className={styles.notifContent}>
                                <div className={styles.notifMessage}>
                                    {t(`notification_${notification.type}`, notification.data) as string}
                                </div>
                                <div className={styles.notifTime}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {notifications.some(n => n.isRead) ? (
                <div className={styles.notificationFooter}>
                    <button className={styles.clearReadBtn} onClick={async () => {
                        try {
                            await notificationService.deleteReadNotifications();
                            setNotifications(notifications.filter(n => !n.isRead));
                        } catch (e) { console.error(e); }
                    }}>
                        {t('clear_read')}
                    </button>
                </div>
            ) : null}
            {/* Show footer even if no read notifications to keep layout consistent? Or maybe only if there are notifications?
                User just said "button at the bottom". Let's conditonally render if allow clearing. */}
        </div>
    );
};

export default NotificationDropdown;
