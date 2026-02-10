'use client';

import { useEffect } from 'react';
import { trackInteraction, WEIGHTS } from '@/lib/tmdb';
import { Movie } from '@/lib/types';

export default function TrackView({ movie }: { movie: Movie }) {
    useEffect(() => {
        if (movie) {
            trackInteraction(movie, WEIGHTS.DETAIL);
        }
    }, [movie]);

    return null;
}
