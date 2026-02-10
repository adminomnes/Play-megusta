'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';
import { fetchTMDB, TMDB_ENDPOINTS } from '@/lib/tmdb';
import { Movie } from '@/lib/types';
import styles from './Search.module.css';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'all' | 'movie' | 'tv'>('all');

    useEffect(() => {
        if (query) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setLoading(true);
            fetchTMDB(TMDB_ENDPOINTS.searchMulti, { query })
                .then(data => {
                    // Filter out people
                    const filtered = data.results.filter((item: Movie) => item.media_type !== 'person');
                    setResults(filtered);
                })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [query]);

    const filteredResults = tab === 'all'
        ? results
        : results.filter(item => item.media_type === tab);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Resultados para: <span>{query}</span></h1>

                <div className={styles.tabs}>
                    <button className={tab === 'all' ? styles.active : ''} onClick={() => setTab('all')}>Todo</button>
                    <button className={tab === 'movie' ? styles.active : ''} onClick={() => setTab('movie')}>Películas</button>
                    <button className={tab === 'tv' ? styles.active : ''} onClick={() => setTab('tv')}>Series</button>
                </div>
            </div>

            {loading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '4px' }} />)}
                </div>
            ) : filteredResults.length > 0 ? (
                <div className={styles.grid}>
                    {filteredResults.map((item) => (
                        <Card key={item.id} movie={item} type={item.media_type as 'movie' | 'tv' || 'movie'} />
                    ))}
                </div>
            ) : query && (
                <div className={styles.noResults}>
                    <p>Tu búsqueda de &quot;{query}&quot; no arrojó resultados.</p>
                    <ul>
                        <li>Intenta con palabras clave diferentes</li>
                        <li>Busca el título de una película o serie</li>
                        <li>Busca un género, como comedia o acción</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main className={styles.searchPage}>
            <Navbar />
            <Suspense fallback={<div style={{ marginTop: '100px' }}>Cargando...</div>}>
                <SearchResults />
            </Suspense>
            <Footer />
        </main>
    );
}
