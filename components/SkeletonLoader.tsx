import React from 'react';
import styles from './SkeletonLoader.module.css';

const SkeletonLoader = ({ type = 'row' }: { type?: 'row' | 'hero' | 'grid' }) => {
    if (type === 'hero') {
        return (
            <div className={`${styles.heroSkeleton} skeleton`}>
                <div className={styles.heroContent}>
                    <div className={`${styles.titleSkeleton} skeleton`} />
                    <div className={`${styles.textSkeleton} skeleton`} />
                    <div className={`${styles.btnSkeleton} skeleton`} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.rowSkeleton}>
            <div className={`${styles.rowTitleSkeleton} skeleton`} />
            <div className={styles.cardContainer}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`${styles.cardSkeleton} skeleton`} />
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
