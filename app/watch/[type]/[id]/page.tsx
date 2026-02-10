import { fetchTMDB } from '@/lib/tmdb';
import { Movie, Video } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './Watch.module.css';

interface Props {
    params: Promise<{
        type: string;
        id: string;
    }>;
}


export default async function WatchPage({ params }: Props) {
    const { type, id } = await params;

    const [details, videos] = await Promise.all([
        fetchTMDB(`${type}/${id}`),
        fetchTMDB(`${type}/${id}/videos`),
    ]);

    // Lógica para streaming real futuro: 
    // if (details.video_url) return <RealPlayer url={details.video_url} />

    const trailer = videos.results?.find(
        (v: Video) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || videos.results?.find(
        (v: Video) => v.site === 'YouTube'
    );

    return (
        <main className={styles.watchPage}>
            <Navbar />

            <div className={styles.playerContainer}>
                <div className={styles.backBtn}>
                    <Link href={`/details/${type}/${id}`}>
                        <ChevronLeft size={32} />
                        Regresar a detalles
                    </Link>
                </div>

                {trailer ? (
                    <div className={styles.aspectRatio}>
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`}
                            title={details.title || details.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={styles.iframe}
                        />
                    </div>
                ) : (
                    <div className={styles.noTrailer}>
                        <h2>Trailer no disponible</h2>
                        <p>Lo sentimos, no encontramos un trailer para {details.title || details.name}.</p>
                        <Link href={`/details/${type}/${id}`} className={styles.link}>
                            Volver a Detalles
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <h1 className={styles.title}>{details.title || details.name}</h1>
                <p className={styles.desc}>{details.overview}</p>
            </div>
        </main>
    );
}
