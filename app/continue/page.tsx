'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import styles from '../movies/Catalog.module.css';
import Link from 'next/link';
import { Movie } from '@/lib/types';

export default function ContinuePage() {
    const [list, setList] = useState<Movie[]>([]);

    useEffect(() => {
        // Load data on client side only
        const continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]');
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setList(continueWatching);
    }, []); // Empty dependency array is correct for mount-only execution

    return (
        <main>
            <Navbar />

            <div className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Continuar viendo</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Retoma tus películas y series donde las dejaste.</p>
                </div>
            </div>

            <div className={styles.container}>
                {list.length > 0 ? (
                    <div className={styles.grid}>
                        {list.map((item) => (
                            <Card key={item.id} movie={item} type={item.media_type as 'movie' | 'tv' || 'movie'} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>No tienes contenido pendiente</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Los títulos que empieces a ver aparecerán aquí automáticamente.</p>
                        <Link href="/" style={{ color: 'var(--neon-cyan)', marginTop: '20px', display: 'inline-block', textDecoration: 'underline' }}>Ir al Inicio</Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
