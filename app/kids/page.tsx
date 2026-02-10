import { fetchTMDB, TMDB_ENDPOINTS, GENRE_MAP } from '@/lib/tmdb';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Row from '@/components/Row';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getKidsData() {
    const [popular, animation, family] = await Promise.all([
        fetchTMDB(TMDB_ENDPOINTS.discoverMovie, {
            with_genres: `${GENRE_MAP.animacion},${GENRE_MAP.kids}`,
            without_genres: '27,53,80', // Horror, Thriller, Crime
            sort_by: 'popularity.desc'
        }),
        fetchTMDB(TMDB_ENDPOINTS.discoverMovie, {
            with_genres: GENRE_MAP.animacion,
            without_genres: '27,53,80'
        }),
        fetchTMDB(TMDB_ENDPOINTS.discoverMovie, {
            with_genres: GENRE_MAP.kids,
            without_genres: '27,53,80'
        }),
    ]);

    return {
        hero: popular.results[0],
        rows: [
            { title: 'Kids – Populares', movies: popular.results },
            { title: 'Kids – Animación', movies: animation.results },
            { title: 'Kids – Familiar', movies: family.results },
        ]
    };
}

export default async function KidsPage() {
    const data = await getKidsData();

    return (
        <main className="kids-mode">
            <Navbar />
            <Hero movie={data.hero} />

            <div style={{ marginTop: '-150px', position: 'relative', zIndex: 20 }}>
                {data.rows.map((row, index) => (
                    <Row key={index} title={row.title} movies={row.movies} type="movie" />
                ))}
            </div>

            <Footer />
        </main>
    );
}
