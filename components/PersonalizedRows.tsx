'use client';

import React, { useState, useEffect } from 'react';
import Row from './Row';
import { fetchTMDB, TMDB_ENDPOINTS, getTopGenres } from '@/lib/tmdb';

const PersonalizedRows = () => {
    const [continueWatching, setContinueWatching] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);

    useEffect(() => {
        // Load Continue Watching
        const cw = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        setContinueWatching(cw);

        // Load Recommended based on top genres
        const topGenres = getTopGenres();
        if (topGenres.length > 0) {
            fetchTMDB(TMDB_ENDPOINTS.discoverMovie, {
                with_genres: topGenres.join(','),
                vote_count: 'gte=50'
            }).then(data => {
                setRecommended(data.results);
            }).catch(console.error);
        }
    }, []);

    return (
        <>
            {continueWatching.length > 0 && (
                <Row title="Continuar viendo" movies={continueWatching} />
            )}
            {recommended.length > 0 && (
                <Row title="Recomendado para ti" movies={recommended} />
            )}
        </>
    );
};

export default PersonalizedRows;
