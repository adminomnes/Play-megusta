/**
 * Lógica común para las páginas individuales de programas
 */

document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.dataset.programId;
    if (!pageId) return;

    const program = PROGRAMAS_DATA.find(p => p.id === pageId);
    if (!program) return;

    renderDetails(program);
});

function renderDetails(p) {
    // Inyectar Hero y descripción
    const heroTitle = document.getElementById('det-title');
    if (heroTitle) heroTitle.innerText = p.nombre;

    const heroDesc = document.getElementById('det-desc');
    if (heroDesc) heroDesc.innerText = p.descripcion;

    const heroBackdrop = document.getElementById('det-hero');
    if (heroBackdrop) heroBackdrop.style.backgroundImage = `url('${p.cover}')`;

    // Inyectar Fotos
    const gallery = document.getElementById('gallery-grid');
    if (gallery && p.fotos.length > 0) {
        gallery.innerHTML = p.fotos.map((f, i) => `
            <div class="photo-card" onclick="openLightbox(${i})">
                <img src="${f.thumb}" alt="${f.alt}">
            </div>
        `).join('');
    }

    // Inyectar Videos
    const videos = document.getElementById('videos-grid');
    if (videos && p.videos.length > 0) {
        videos.innerHTML = p.videos.map((v, i) => {
            if (v.type === 'spotify') {
                return `
                    <div class="spotify-embed" style="width: 100%; margin-bottom: 20px;">
                        <iframe style="border-radius:12px" src="${v.src}" width="100%" height="${v.height || '352'}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                    </div>
                `;
            }
            return `
            <div class="video-card" onclick="openVideoPlayer('${v.src}')">
                <div class="thumb">
                    <img src="${v.thumb}">
                    <div class="play-btn">▶</div>
                </div>
                <div class="v-title">${v.titulo}</div>
            </div>
            `;
        }).join('');
    }
}

function openVideoPlayer(src) {
    // Reutilizar el video overlay del index si existe, o crear uno
    alert("Iniciando video: " + src);
}

function openLightbox(index) {
    alert("Abriendo Lightbox Foto index: " + index);
}
