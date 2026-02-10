import Hero from '@/components/Hero';
import Row from '@/components/Row';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchTMDB, TMDB_ENDPOINTS, GENRE_MAP } from '@/lib/tmdb';

import PersonalizedRows from '@/components/PersonalizedRows';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

async function getHomeData() {
  const [
    trending,
    trendingWeek,
    popularMovies,
    popularTV,
    topRatedMovies,
    topRatedTV,
    upcoming,
    airingToday,
    action,
    comedy,
    romance,
    horror,
    scifi,
    animation,
    documentary,
    drama,
    crime,
  ] = await Promise.all([
    fetchTMDB(TMDB_ENDPOINTS.trendingDay),
    fetchTMDB(TMDB_ENDPOINTS.trendingWeek),
    fetchTMDB(TMDB_ENDPOINTS.popularMovies),
    fetchTMDB(TMDB_ENDPOINTS.popularTV),
    fetchTMDB(TMDB_ENDPOINTS.topRatedMovies),
    fetchTMDB(TMDB_ENDPOINTS.topRatedTV),
    fetchTMDB(TMDB_ENDPOINTS.upcomingMovies),
    fetchTMDB(TMDB_ENDPOINTS.airingTodayTV),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.accion }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.comedia }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.romance }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.terror }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.scifi }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.animacion }),
    fetchTMDB(TMDB_ENDPOINTS.discoverMovie, { with_genres: GENRE_MAP.documental }),
    fetchTMDB(TMDB_ENDPOINTS.discoverTV, { with_genres: GENRE_MAP.drama }),
    fetchTMDB(TMDB_ENDPOINTS.discoverTV, { with_genres: `${GENRE_MAP.crimen},${GENRE_MAP.misterio}` }),
  ]);

  return {
    hero: trending.results[Math.floor(Math.random() * 5)],
    rows: [
      { title: 'Tendencias hoy', movies: trending.results },
      { title: 'Tendencias de la semana', movies: trendingWeek.results },
      { title: 'Películas populares', movies: popularMovies.results, type: 'movie' },
      { title: 'Series populares', movies: popularTV.results, type: 'tv' },
      { title: 'Mejor calificadas (Cine)', movies: topRatedMovies.results, type: 'movie' },
      { title: 'Series de TV aclamadas', movies: topRatedTV.results, type: 'tv' },
      { title: 'Próximos estrenos', movies: upcoming.results, type: 'movie' },
      { title: 'En emisión hoy', movies: airingToday.results, type: 'tv' },
      { title: 'Acción Explosiva', movies: action.results, type: 'movie' },
      { title: 'Hora de Reír', movies: comedy.results, type: 'movie' },
      { title: 'Romance Neón', movies: romance.results, type: 'movie' },
      { title: 'Pánico y Terror', movies: horror.results, type: 'movie' },
      { title: 'Ciencia Ficción', movies: scifi.results, type: 'movie' },
      { title: 'Mundos Animados', movies: animation.results, type: 'movie' },
      { title: 'Realidad Documentada', movies: documentary.results, type: 'movie' },
      { title: 'Drama y Emoción', movies: drama.results, type: 'tv' },
      { title: 'Crimen y Misterio', movies: crime.results, type: 'tv' },
    ]
  };
}

export default async function Home() {
  const data = await getHomeData();

  return (
    <main style={{ paddingBottom: '50px' }}>
      <Navbar />
      <Hero movie={data.hero} />

      <div style={{ marginTop: '-150px', position: 'relative', zIndex: 20 }}>
        <PersonalizedRows />
        {data.rows.map((row, index) => (
          <Row key={index} title={row.title} movies={row.movies} type={row.type as 'movie' | 'tv'} />
        ))}
      </div>

      <Footer />
    </main>
  );
}
