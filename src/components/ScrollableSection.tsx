import React from 'react';
import styles from './ScrollableSection.module.css';

interface ScrollableSectionProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string | number;
    variant?: 'default' | 'wide';
}

function ScrollableSection<T>({ title, items, renderItem, keyExtractor, variant = 'default' }: ScrollableSectionProps<T>) {
    // If no items, rendering nothing or placeholder is up to parent? 
    // Usually section disappears if empty, or parent handles it.
    // Let's render nothing if empty to be safe.
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.title}>{title}</h2>
            </div>

            <div className={styles.scrollContainer}>
                {items.map((item) => (
                    <div
                        key={keyExtractor(item)}
                        className={`${styles.itemWrapper} ${variant === 'wide' ? styles.wideItem : ''}`}
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ScrollableSection;
