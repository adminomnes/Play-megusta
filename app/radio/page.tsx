'use client';

import React, { useState, useRef, useEffect } from 'react'; // Added useEffect import
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, Pause, Radio as RadioIcon, Volume2, Bell } from 'lucide-react';
import styles from './Radio.module.css';

// Placeholder streams - replace with real ones
const STREAM_URL = "https://fpsnew1.listen2myradio.com:2199/listen.php?ip=82.145.63.6&port=9344&type=s1";
const VIDEO_ID = "jfKfPfyJRdk"; // Lofi Girl as placeholder

export default function RadioPage() {
    const [subscribed, setSubscribed] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        // Load initial state
        const isSubscribed = localStorage.getItem('radio_subscribed') === 'true';
        setSubscribed(isSubscribed);

        const notifStatus = localStorage.getItem('radio_notifications') === 'true';
        setNotificationsEnabled(notifStatus);
    }, []);

    const toggleSubscription = () => {
        const newState = !subscribed;
        setSubscribed(newState);
        localStorage.setItem('radio_subscribed', String(newState));
        if (newState) {
            alert("¡Te has suscrito a Radio Me Gusta!");
        }
    };

    const toggleNotifications = () => {
        if (!notificationsEnabled) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setNotificationsEnabled(true);
                    localStorage.setItem('radio_notifications', 'true');
                    new Notification("Radio Me Gusta", { body: "¡Notificaciones activadas!" });
                }
            });
        } else {
            setNotificationsEnabled(false);
            localStorage.setItem('radio_notifications', 'false');
        }
    };

    return (
        <main className={styles.page}>
            <Navbar />

            {/* Radio Brand Header */}
            <div className={styles.radioHeader}>
                <div className={styles.brandContainer}>
                    <img
                        src="https://i.ibb.co/99Tdd8t1/Dise-o-sin-t-tulo-9-removebg-preview.png"
                        alt="Radio Me Gusta"
                        className={styles.brandLogo}
                    />
                    <div className={styles.brandInfo}>
                        <div className={styles.badge}>🔴 EN VIVO</div>
                        <h1 className={styles.brandTitle}>Radio Me Gusta</h1>
                        <p className={styles.brandDesc}>
                            La mejor música, entrevistas exclusivas y todo el entretenimiento que te gusta, las 24 horas del día.
                        </p>

                        <div className={styles.benefits}>
                            <span>✨ Sin anuncios</span>
                            <span>🔔 Alertas en vivo</span>
                            <span>🎵 Pedidos VIP</span>
                        </div>

                        <div className={styles.actionButtons}>
                            <button
                                className={`${styles.subBtn} ${subscribed ? styles.subscribed : ''}`}
                                onClick={toggleSubscription}
                            >
                                {subscribed ? 'Siguiendo' : '+ Suscribirse'}
                            </button>

                            <button
                                className={`${styles.iconBtn} ${notificationsEnabled ? styles.active : ''}`}
                                onClick={toggleNotifications}
                                title="Recibir notificaciones"
                            >
                                <Bell size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className={styles.hero}>
                {/* Live Video Player */}
                <div className={styles.liveContainer}>
                    <div style={{ width: '100%', height: '0px', position: 'relative', paddingBottom: '56.25%' }}>
                        <iframe
                            src="https://player.onestream.live/embed?token=NDg1OTUyNA==&type=up"
                            style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}
                            scrolling="no"
                            frameBorder="0"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* Audio Player Section */}
                <AudioPlayer />
            </section>

            {/* Schedule Section */}
            <section className={styles.scheduleSection}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem' }}>Programación Semanal</h2>
                <div className={styles.scheduleGrid}>
                    {[
                        { time: '08:00 - 12:00', name: 'El Mañanero', dj: 'DJ Alex' },
                        { time: '12:00 - 15:00', name: 'Hits del Momento', dj: 'La Gringa' },
                        { time: '15:00 - 19:00', name: 'Tarde Chill', dj: 'Seba Mix' },
                        { time: '19:00 - 22:00', name: 'Fiesta Neón', dj: 'DJ K-Lix' },
                        { time: '22:00 - 02:00', name: 'Transnoche', dj: 'Automático' },
                    ].map((show, i) => (
                        <div key={i} className={styles.programCard}>
                            <span className={styles.time}>{show.time}</span>
                            <h3 className={styles.programName}>{show.name}</h3>
                            <p className={styles.dj}>{show.dj}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}

function AudioPlayer() {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
        setPlaying(!playing);
    };

    return (
        <div className={styles.radioControls}>
            <div className={styles.playerLeft}>
                <button onClick={togglePlay} className={styles.playBtn}>
                    {playing ? <Pause fill="white" /> : <Play fill="white" style={{ marginLeft: '4px' }} />}
                </button>
                <div style={{ marginLeft: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Radio Me Gusta FM</h3>
                    <span style={{ color: 'var(--neon-cyan)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <RadioIcon size={14} /> En el aire
                    </span>
                </div>
            </div>

            {/* Visualizer Animation */}
            <div className={`${styles.visualizer} ${playing ? styles.playing : ''}`}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.bar}
                        style={{
                            animationDelay: `${Math.random() * 0.5}s`,
                            height: playing ? `${Math.random() * 50 + 20}%` : '10%'
                        }}
                    />
                ))}
            </div>

            <Volume2 color="var(--text-muted)" />
            <audio ref={audioRef} src={STREAM_URL} preload="none" />
        </div>
    );
}
