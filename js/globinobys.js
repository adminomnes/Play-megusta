
import { supabase } from '../src/lib/supabaseClient.js';

const DEFAULT_COVER = 'https://i.ibb.co/sdNCjFn8/Chat-GPT-Image-7-feb-2026-11-56-45-p-m.png';

const initialSongs = [
    {
        id: '1',
        title: 'Amistad',
        artist: 'Globinobys',
        cover_url: DEFAULT_COVER,
        audio_url: 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/Amistad.mp3'
    },
    {
        id: '2',
        title: 'El Verano',
        artist: 'Globinobys',
        cover_url: DEFAULT_COVER,
        audio_url: 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/El%20Verano.mp3'
    },
    {
        id: '3',
        title: 'Juego de Palabras',
        artist: 'Globinobys',
        cover_url: DEFAULT_COVER,
        audio_url: 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/juego%20de%20palabras%20.mp3'
    },
    {
        id: '4',
        title: 'Vitaminas',
        artist: 'Globinobys',
        cover_url: DEFAULT_COVER,
        audio_url: 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/Vitaminas%20lista.mp3'
    }
];

class GlobinobysPlayer {
    constructor() {
        this.songs = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.seeking = false;

        // Elements from User Provided UI
        this.audio = document.getElementById('rmgAudio');
        this.btnPlay = document.getElementById('rmgPlay');
        this.btnPrev = document.getElementById('rmgPrev');
        this.btnNext = document.getElementById('rmgNext');
        this.seek = document.getElementById('rmgSeek');
        this.vol = document.getElementById('rmgVol');
        this.titleEl = document.getElementById('rmgTitle');
        this.artistEl = document.getElementById('rmgArtist');
        this.timeEl = document.getElementById('rmgTime');
        this.durEl = document.getElementById('rmgDur');
        this.coverEl = document.getElementById('rmgCover');

        // Featured UI
        this.featuredCover = document.getElementById('featuredCover');
        this.featuredTitle = document.getElementById('featuredTitle');
        this.featuredArtist = document.getElementById('featuredArtist');
        this.featuredSection = document.getElementById('featuredSection');

        // Grid
        this.songsGrid = document.getElementById('songsGrid');

        this.init();
    }

    async init() {
        await this.loadSongs();
        this.setupEventListeners();
        this.renderSongs();
        this.loadTrack(0, false);
    }

    async loadSongs() {
        try {
            const { data, error } = await supabase.from('songs_kids').select('*').eq('active', true).order('created_at', { ascending: false });
            if (error || !data || data.length === 0) {
                this.songs = initialSongs;
            } else {
                this.songs = data;
            }
        } catch (err) {
            this.songs = initialSongs;
        }
    }

    setupEventListeners() {
        this.btnPlay.onclick = () => this.togglePlay();
        this.btnPrev.onclick = () => this.prevSong();
        this.btnNext.onclick = () => this.nextSong();

        this.vol.oninput = () => {
            this.audio.volume = this.vol.value / 100;
        };

        this.audio.onloadedmetadata = () => {
            this.durEl.textContent = this.formatTime(this.audio.duration);
        };

        this.audio.ontimeupdate = () => {
            if (this.seeking) return;
            const p = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0;
            this.seek.value = p;
            this.timeEl.textContent = this.formatTime(this.audio.currentTime);
        };

        this.seek.oninput = () => { this.seeking = true; };
        this.seek.onchange = () => {
            const p = this.seek.value / 100;
            if (this.audio.duration) this.audio.currentTime = p * this.audio.duration;
            this.seeking = false;
        };

        this.audio.onended = () => this.nextSong();

        // Optional: Click on featured section toggles play
        if (this.featuredSection) {
            this.featuredSection.onclick = (e) => {
                if (e.target.closest('.featured-content')) {
                    this.togglePlay();
                }
            };
        }
    }

    renderSongs() {
        if (!this.songsGrid) return;
        this.songsGrid.innerHTML = '';
        this.songs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = `song-card ${this.currentIndex === index && this.isPlaying ? 'active' : ''}`;
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="song-cover-wrapper">
                    <img src="${song.cover_url || DEFAULT_COVER}" class="song-cover" alt="${song.title}">
                </div>
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <p>${song.artist || 'Globinobys'}</p>
                </div>
            `;
            card.onclick = (e) => {
                e.stopPropagation();
                this.playSong(index);
            };
            this.songsGrid.appendChild(card);
        });
    }

    loadTrack(index, autoPlay = true) {
        this.currentIndex = index;
        const song = this.songs[index];
        if (!song) return;

        this.audio.src = song.audio_url;
        this.titleEl.textContent = song.title;
        this.artistEl.textContent = song.artist || 'Globinobys';
        this.coverEl.src = song.cover_url || DEFAULT_COVER;

        if (this.featuredTitle) this.featuredTitle.textContent = song.title;
        if (this.featuredArtist) this.featuredArtist.textContent = song.artist || 'Globinobys';
        if (this.featuredCover) this.featuredCover.src = song.cover_url || DEFAULT_COVER;

        if (autoPlay) this.play();
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updateUI();
        } catch (e) {
            console.error("Playback failed", e);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    }

    togglePlay() {
        if (this.audio.paused) this.play(); else this.pause();
    }

    playSong(index) {
        this.loadTrack(index, true);
    }

    prevSong() {
        let idx = this.currentIndex - 1;
        if (idx < 0) idx = this.songs.length - 1;
        this.loadTrack(idx, true);
    }

    nextSong() {
        let idx = this.currentIndex + 1;
        if (idx >= this.songs.length) idx = 0;
        this.loadTrack(idx, true);
    }

    updateUI() {
        this.btnPlay.textContent = this.isPlaying ? "⏸" : "▶";

        if (this.isPlaying) {
            this.featuredSection?.classList.add('is-playing');
        } else {
            this.featuredSection?.classList.remove('is-playing');
        }

        this.renderSongs();
    }

    formatTime(sec) {
        if (!isFinite(sec)) return "0:00";
        sec = Math.max(0, Math.floor(sec));
        const m = Math.floor(sec / 60);
        const s = String(sec % 60).padStart(2, "0");
        return `${m}:${s}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.globinobysPlayer = new GlobinobysPlayer();
});
