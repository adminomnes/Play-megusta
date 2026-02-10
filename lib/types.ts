export interface Movie {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    genre_ids: number[];
    media_type?: 'movie' | 'tv';
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
