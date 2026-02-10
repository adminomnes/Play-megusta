export interface Movie {
    id: number;
    title?: string;
    name?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    genres?: { id: number; name: string }[];
    media_type?: 'movie' | 'tv' | 'person';
}

export interface Genre {
    id: number;
    name: string;
}

export interface Video {
    key: string;
    site: string;
    type: string;
}

export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string;
}
