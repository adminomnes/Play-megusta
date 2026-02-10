'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Plus, ChevronDown, Check } from 'lucide-react';
import { Movie } from '@/lib/types';
import { getImageUrl, trackInteraction, WEIGHTS } from '@/lib/tmdb';
import styles from './Card.module.css';

interface CardProps {
    movie: Movie;
    type?: 'movie' | 'tv';
}

const Card: React.FC<CardProps> = ({ movie, type = 'movie' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [inList, setInList] = useState(false);

    const toggleList = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setInList(!inList);
        // Logic for localStorage will go here
        const myList = JSON.parse(localStorage.getItem('myList') || '[]');
        if (!inList) {
            localStorage.setItem('myList', JSON.stringify([...myList, { ...movie, media_type: type }]));
        } else {
            localStorage.setItem('myList', JSON.stringify(myList.filter((m: any) => m.id !== movie.id)));
        }
    };

    return (
        <div
            className={styles.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/details/${type}/${movie.id}`}>
                <div className={styles.imageContainer}>
                    <img
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title || movie.name}
                        loading="lazy"
                        className={styles.poster}
                    />
                </div>

                {isHovered && (
                    <div className={styles.hoverInfo}>
                        <div className={styles.hoverImage}>
                            <img src={getImageUrl(movie.backdrop_path)} alt="" />
                            <div className={styles.miniPlay}>
                                <Play fill="white" size={24} />
                            </div>
                        </div>

                        <div className={styles.details}>
                            <div className={styles.controls}>
                                <Link
                                    href={`/watch/${type}/${movie.id}`}
                                    className={styles.roundBtn}
                                    title="Reproducir"
                                    onClick={() => trackInteraction(movie, WEIGHTS.WATCH)}
                                >
                                    <Play fill="black" size={16} />
                                </Link>
                                <button
                                    className={`${styles.roundBtn} ${inList ? styles.active : ''}`}
                                    onClick={(e) => {
                                        toggleList(e);
                                        if (!inList) trackInteraction(movie, WEIGHTS.LIST);
                                    }}
                                    title="Mi Lista"
                                >
                                    {inList ? <Check size={16} /> : <Plus size={16} />}
                                </button>
                                <Link
                                    href={`/details/${type}/${movie.id}`}
                                    className={styles.roundBtn}
                                    title="Más Info"
                                    onClick={() => trackInteraction(movie, WEIGHTS.DETAIL)}
                                >
                                    <ChevronDown size={16} />
                                </Link>
                            </div>

                            <h4 className={styles.title}>{movie.title || movie.name}</h4>
                            <div className={styles.meta}>
                                <span className={styles.rating}>{movie.vote_average.toFixed(1)} Match</span>
                                <span className={styles.year}>{(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default Card;
