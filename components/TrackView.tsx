'use client';

import { useEffect } from 'react';
import { trackInteraction, WEIGHTS } from '@/lib/tmdb';

export default function TrackView({ movie }: { movie: any }) {
    useEffect(() => {
        if (movie) {
            trackInteraction(movie, WEIGHTS.DETAIL);
        }
    }, [movie]);

    return null;
}
