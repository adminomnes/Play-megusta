import { fetchTMDB, getImageUrl } from '@/lib/tmdb';
import { Movie, Genre } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Row from '@/components/Row';
import { Play, Plus, Star, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './Details.module.css';
import TrackView from '@/components/TrackView';

interface Props {
    params: Promise<{
        type: string;
        id: string;
    }>;
}


export default async function DetailsPage({ params }: Props) {
    const { type, id } = await params;

    const [details, credits, videos, recommendations] = await Promise.all([
        fetchTMDB(`${type}/${id}`),
        fetchTMDB(`${type}/${id}/credits`),
        fetchTMDB(`${type}/${id}/videos`),
        fetchTMDB(`${type}/${id}/recommendations`),
    ]);

    const trailer = videos.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos.results?.[0];
    const cast = credits.cast?.slice(0, 10);

    return (
        <main>
            <Navbar />
            <TrackView movie={details} />

            <div className={styles.hero}>
                <div className={styles.backdrop}>
                    <img
                        src={getImageUrl(details.backdrop_path, 'original')}
                        alt={details.title || details.name}
                    />
                    <div className={styles.overlay} />
                </div>

                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.poster}>
                            <img src={getImageUrl(details.poster_path)} alt="" />
                        </div>

                        <div className={styles.info}>
                            <h1 className={styles.title}>{details.title || details.name}</h1>

                            <div className={styles.metadata}>
                                <span className={styles.rating}>
                                    <Star size={18} fill="var(--neon-cyan)" stroke="var(--neon-cyan)" />
                                    {(details.vote_average || 0).toFixed(1)}
                                </span>
                                <span className={styles.year}>
                                    {new Date(details.release_date || details.first_air_date).getFullYear()}
                                </span>
                                {details.runtime && (
                                    <span className={styles.runtime}>
                                        <Clock size={16} /> {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                    </span>
                                )}
                                {details.number_of_seasons && (
                                    <span>{details.number_of_seasons} Temporadas</span>
                                )}
                            </div>

                            <div className={styles.genres}>
                                {details.genres?.map((g: Genre) => (
                                    <span key={g.id} className={styles.genreTag}>{g.name}</span>
                                ))}
                            </div>

                            <p className={styles.tagline}>{details.tagline}</p>
                            <p className={styles.overview}>{details.overview}</p>

                            <div className={styles.actions}>
                                <Link href={`/watch/${type}/${id}`} className={styles.playBtn}>
                                    <Play size={22} fill="black" /> Ver Trailer
                                </Link>
                                <button className={styles.listBtn}>
                                    <Plus size={22} /> Mi Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className={styles.castSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Reparto Principal</h2>
                    <div className={styles.castGrid}>
                        {cast?.map((person: any) => (
                            <div key={person.id} className={styles.person}>
                                <div className={styles.personImage}>
                                    {person.profile_path ? (
                                        <img src={getImageUrl(person.profile_path)} alt={person.name} />
                                    ) : (
                                        <div className={styles.placeholder} />
                                    )}
                                </div>
                                <p className={styles.name}>{person.name}</p>
                                <p className={styles.character}>{person.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {recommendations.results?.length > 0 && (
                <Row title="Títulos similares" movies={recommendations.results} type={type as 'movie' | 'tv'} />
            )}

            <Footer />
        </main>
    );
}
