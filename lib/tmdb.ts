const TMDB_INTERNAL_BASE = 'https://api.themoviedb.org/3';

export async function fetchTMDB(path: string, params: Record<string, string | number> = {}) {
    const queryParams = new URLSearchParams({
        language: 'es-CL',
        ...params,
    } as any);

    // Direct call to TMDB for Static Export (Client-side token)
    // NOTE: This exposes the token, but is required for "Drag & Drop" deployment simplicity.
    const url = `${TMDB_INTERNAL_BASE}/${path}?${queryParams.toString()}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN || process.env.TMDB_BEARER_TOKEN}`,
        },
        next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`TMDB Fetch Error: ${res.status}`);
    return res.json();
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500') {
    if (!path) return '/placeholder.png'; // Handled by component
    return `${TMDB_IMAGE_BASE}${size}${path}`;
}

export const TMDB_ENDPOINTS = {
    trendingDay: 'trending/all/day',
    trendingWeek: 'trending/all/week',
    popularMovies: 'movie/popular',
    popularTV: 'tv/popular',
    topRatedMovies: 'movie/top_rated',
    topRatedTV: 'tv/top_rated',
    upcomingMovies: 'movie/upcoming',
    airingTodayTV: 'tv/airing_today',
    movieGenres: 'genre/movie/list',
    tvGenres: 'genre/tv/list',
    searchMulti: 'search/multi',
    discoverMovie: 'discover/movie',
    discoverTV: 'discover/tv',
};

export const GENRE_MAP: Record<string, number> = {
    accion: 28,
    comedia: 35,
    romance: 10749,
    terror: 27,
    scifi: 878,
    animacion: 16,
    documental: 99,
    drama: 18,
    crimen: 80,
    misterio: 9648,
    kids: 10751, // Family
};

// Tracking Weights
export const WEIGHTS = {
    LIST: 3,
    WATCH: 2,
    DETAIL: 1
};

export function trackInteraction(movie: any, weight: number) {
    if (typeof window === 'undefined' || !movie) return;

    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '{}');
    const genreIds = movie.genre_ids || movie.genres?.map((g: any) => g.id) || [];

    genreIds.forEach((gid: number) => {
        interactions[gid] = (interactions[gid] || 0) + weight;
    });
    localStorage.setItem('userInteractions', JSON.stringify(interactions));

    // Update Continue Watching
    if (weight === WEIGHTS.WATCH) {
        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        const filtered = continueWatching.filter((m: any) => m.id !== movie.id);
        const newItem = {
            id: movie.id,
            title: movie.title || movie.name,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            media_type: movie.media_type || (movie.title ? 'movie' : 'tv'),
            timestamp: Date.now()
        };
        localStorage.setItem('continueWatching', JSON.stringify([newItem, ...filtered].slice(0, 20)));
    }
}

export function getTopGenres() {
    if (typeof window === 'undefined') return [];
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '{}');
    return Object.entries(interactions)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([id]) => id);
}
