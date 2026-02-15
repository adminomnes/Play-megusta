/**
 * Play Me Gusta - Core Logic (Cleaned of TMDB)
 */

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.onscroll = () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

// Hero Slider Logic (Only local programs)
let heroItems = [];
let currentHeroIndex = 0;
let heroTimer;

async function loadHomeContent() {
    // We only use PROGRAMAS_DATA now
    if (typeof PROGRAMAS_DATA !== 'undefined' && PROGRAMAS_DATA.length > 0) {
        heroItems = PROGRAMAS_DATA.slice(0, 5); // Take top 5 for rotation
        startHeroRotation();
    }
}

function startHeroRotation() {
    if (heroTimer) clearInterval(heroTimer);
    updateHero();
    heroTimer = setInterval(nextHero, 6000);
}

function nextHero() {
    currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
    updateHero();
}

function updateHero() {
    const item = heroItems[currentHeroIndex];
    if (!item) return;

    const heroContent = document.querySelector('.hero-content');
    const heroBillboard = document.getElementById('hero-billboard');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');
    const heroPlayLink = document.getElementById('hero-play-link');

    // Smooth transition effect
    if (heroContent) heroContent.classList.add('changing');
    if (heroBillboard) heroBillboard.style.opacity = '0.8';

    setTimeout(() => {
        if (heroBillboard) {
            heroBillboard.style.backgroundImage = `url('${item.cover}')`;
            heroBillboard.style.opacity = '1';
        }
        if (heroTitle) heroTitle.innerText = item.nombre;
        if (heroDesc) heroDesc.innerText = item.descripcion;



        if (heroContent) heroContent.classList.remove('changing');
    }, 800);
}

// Visualizer Bars
const createVisualizer = () => {
    const visualizer = document.getElementById('visualizer');
    if (!visualizer) {
        console.warn("Visualizer container not found (#visualizer)");
        return;
    }
    visualizer.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const duration = 0.5 + Math.random();
        const delay = Math.random();
        bar.style.animationDuration = `${duration}s`;
        bar.style.animationDelay = `${delay}s`;
        // Initial state
        bar.style.animationPlayState = 'paused';
        visualizer.appendChild(bar);
    }
    console.log("Visualizer bars created");
};

// Radio Control Logic
const audioPlayer = document.getElementById('audio-player');
const radioToggle = document.getElementById('radio-toggle');
const radioBtnText = document.getElementById('radio-btn-text');
const playIcon = document.getElementById('play-icon');
const radioStatus = document.getElementById('radio-status');
const radioVolume = document.getElementById('radio-volume');
let isRadioPlaying = false;

function updateVisualizerState(isPlaying) {
    const bars = document.querySelectorAll('.bar');
    console.log(`Setting visualizer state: ${isPlaying ? 'running' : 'paused'} (${bars.length} bars found)`);
    bars.forEach(bar => {
        bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
    });
}

if (radioToggle) {
    radioToggle.addEventListener('click', () => {
        if (!isRadioPlaying) {
            audioPlayer.play().then(() => {
                isRadioPlaying = true;
                radioBtnText.innerText = 'Pausar Radio';
                playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                radioStatus.style.color = '#ff0055'; // Vibrant Magenta
                radioStatus.innerText = '● EN VIVO';
                updateVisualizerState(true);
            }).catch(err => {
                console.error("Error playing audio:", err);
                alert("No se pudo conectar con la señal de radio. Intenta de nuevo más tarde.");
            });
        } else {
            audioPlayer.pause();
            isRadioPlaying = false;
            radioBtnText.innerText = 'Sintonizar Ahora';
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            radioStatus.style.color = 'var(--text-muted)';
            radioStatus.innerText = '● OFF AIR';
            updateVisualizerState(false);
        }
    });
}

if (radioVolume) {
    radioVolume.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });
}

// Intersection Observer for Scroll Reveal
const setupReveal = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
};

// Logout Function
function logout() {
    console.log("Logging out...");
    localStorage.removeItem('play_authenticated');
    window.location.href = 'index.html';
}

// Start everything
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded. Initializing main.js...");
    loadHomeContent();
    createVisualizer();
    setupReveal();

    if (typeof initProgramCarousel === 'function') {
        initProgramCarousel('carousel-programas');
    }

    // Connect playerStore to visualizer if it exists
    if (typeof playerStore !== 'undefined') {
        playerStore.subscribe(({ isPlaying }) => {
            console.log("PlayerStore update - isPlaying:", isPlaying);
            if (isPlaying) updateVisualizerState(true);
            else if (!isRadioPlaying) updateVisualizerState(false);
        });
    } else {
        console.warn("playerStore not found");
    }
});

