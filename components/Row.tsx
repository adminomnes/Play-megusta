'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/lib/types';
import Card from '@/components/Card';
import styles from './Row.module.css';

interface RowProps {
    title: string;
    movies: Movie[];
    type?: 'movie' | 'tv';
}

const Row: React.FC<RowProps> = ({ title, movies, type = 'movie' }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);

    const handleScroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
            setShowLeft(scrollTo > 0);
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className={styles.row}>
            <h2 className={styles.rowTitle}>{title}</h2>

            <div className={styles.rowContainer}>
                {showLeft && (
                    <button className={`${styles.sliderArrow} ${styles.left}`} onClick={() => handleScroll('left')}>
                        <ChevronLeft size={40} />
                    </button>
                )}

                <div className={styles.slider} ref={rowRef} onScroll={(e) => setShowLeft(e.currentTarget.scrollLeft > 0)}>
                    {movies.map((movie) => (
                        <Card key={movie.id} movie={movie} type={type} />
                    ))}
                </div>

                <button className={`${styles.sliderArrow} ${styles.right}`} onClick={() => handleScroll('right')}>
                    <ChevronRight size={40} />
                </button>
            </div>
        </div>
    );
};

export default Row;
