'use client';

import React from 'react';
import { Play, Plus, Info, Star } from 'lucide-react';
import Link from 'next/link';
import { Movie } from '@/lib/types';
import { getImageUrl, trackInteraction, WEIGHTS } from '@/lib/tmdb';
import styles from './Hero.module.css';

interface HeroProps {
    movie: Movie;
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
    if (!movie) return null;

    return (
        <div className={styles.hero}>
            <div className={styles.backdrop}>
                <img
                    src={getImageUrl(movie.backdrop_path, 'original')}
                    alt={movie.title || movie.name}
                    className={styles.backdropImage}
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>{movie.title || movie.name}</h1>

                <div className={styles.meta}>
                    <span className={styles.rating}>
                        <Star size={16} fill="var(--neon-cyan)" stroke="var(--neon-cyan)" />
                        {movie.vote_average.toFixed(1)}
                    </span>
                    <span className={styles.year}>
                        {(movie.release_date || movie.first_air_date || '').split('-')[0]}
                    </span>
                    <span className={styles.badge}>Trending Today</span>
                </div>

                <p className={styles.overview}>{movie.overview}</p>

                <div className={styles.actions}>
                    <Link
                        href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                        className={styles.playBtn}
                        onClick={() => trackInteraction(movie, WEIGHTS.WATCH)}
                    >
                        <Play size={20} fill="black" />
                        Reproducir
                    </Link>
                    <button
                        className={styles.listBtn}
                        onClick={() => trackInteraction(movie, WEIGHTS.LIST)}
                    >
                        <Plus size={20} />
                        Mi Lista
                    </button>
                    <Link
                        href={`/details/${movie.media_type || 'movie'}/${movie.id}`}
                        className={styles.infoBtn}
                        onClick={() => trackInteraction(movie, WEIGHTS.DETAIL)}
                    >
                        <Info size={20} />
                        Más información
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
