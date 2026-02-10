import { fetchTMDB, TMDB_ENDPOINTS } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import styles from './Catalog.module.css';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
    const { genre: genreId } = await searchParams;

    const [data, genres] = await Promise.all([
        fetchTMDB(genreId ? TMDB_ENDPOINTS.discoverMovie : TMDB_ENDPOINTS.popularMovies, {
            with_genres: genreId || '',
            page: 1
        }),
        fetchTMDB(TMDB_ENDPOINTS.movieGenres)
    ]);

    return (
        <main>
            <Navbar />

            <div className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Películas</h1>
                    <div className={styles.filters}>
                        {genres.genres.slice(0, 10).map((g: any) => (
                            <a
                                key={g.id}
                                href={`/movies?genre=${g.id}`}
                                className={`${styles.filterBtn} ${genreId == g.id ? styles.active : ''}`}
                            >
                                {g.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.grid}>
                    {data.results.map((item: any) => (
                        <Card key={item.id} movie={item} type="movie" />
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
