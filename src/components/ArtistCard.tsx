import React from 'react';
import styles from './ArtistCard.module.css';

interface Artist {
    _id: string;
    artistName: string;
    userId: {
        fullName: string;
        avatar?: string;
    };
}

interface ArtistCardProps {
    artist: Artist;
    onClick?: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
    // Helper to get initials
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Prioritize artist avatar from user profile
    const imageUrl = artist.userId?.avatar;

    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.imageWrapper}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={artist.artistName}
                        className={styles.artistImage}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        {getInitials(artist.artistName)}
                    </div>
                )}
            </div>
            <div className={styles.artistName}>{artist.artistName}</div>
        </div>
    );
};

export default ArtistCard;
