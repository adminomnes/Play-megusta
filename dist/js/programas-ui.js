/**
 * Lógica de interfaz para programas y carruseles inteligentes
 */

// Renderizar un Programa (Card)
function createProgramCard(program) {
    return `
        <div class="program-card" data-id="${program.id}" 
             onmouseenter="handleHover(this, true)" 
             onmouseleave="handleHover(this, false)"
             onclick="handleClick(event, '${program.id}')">
            <div class="card-glow" style="background: ${program.color || 'var(--spotify-green)'}"></div>
            ${program.badge ? `
                <div class="program-badge-premium">
                    <span class="badge-dot"></span>
                    ${program.badge.toUpperCase()}
                </div>
            ` : ''}
            <img src="${program.cover}" class="cover" alt="${program.nombre}" loading="lazy">
            <video class="preview-video" muted loop playsinline src="${program.trailer}"></video>
            
            <div class="program-card-overlay">
                <div class="overlay-content">
                    <div class="category-tag-premium" style="background:${program.color || 'var(--spotify-green)'}22; color:${program.color || 'var(--spotify-green)'}">
                        ${program.categoria}
                    </div>
                    <div class="program-title-premium">${program.nombre}</div>
                    <div class="program-actions-mini">
                        <button class="btn-play-card" onclick="navigate('${program.id}'); event.stopPropagation();">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Manejo de Click (Móvil vs Desktop)
function handleClick(e, id) {
    if (window.innerWidth <= 768) {
        showMobilePreview(id);
    } else {
        navigate(id);
    }
}

// Modal Preview Móvil
function showMobilePreview(id) {
    const program = PROGRAMAS_DATA.find(p => p.id === id);
    if (!program) return;

    let modal = document.getElementById('preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.className = 'preview-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <span class="close-preview" onclick="hideMobilePreview()">&times;</span>
        <h3 style="margin-bottom:10px;">${program.nombre}</h3>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:20px;">${program.descripcion}</p>
        <div class="hero-actions" style="display:flex; gap:10px;">
            <button class="btn btn-primary" onclick="navigate('${id}')" style="flex:1;">Ver Ahora</button>
            <button class="btn btn-secondary" onclick="hideMobilePreview()" style="flex:1;">Cerrar</button>
        </div>
    `;
    modal.style.display = 'block';
}

function hideMobilePreview() {
    const modal = document.getElementById('preview-modal');
    if (modal) modal.style.display = 'none';
}

// Manejo de Hover Video (Desktop)
function handleHover(el, isIn) {
    if (window.innerWidth <= 768) return; // Omitir en móvil

    const video = el.querySelector('.preview-video');
    if (!video || !video.getAttribute('src')) return;

    if (isIn) {
        video.play().catch(e => console.log("Autoplay blocked"));
    } else {
        video.pause();
        video.currentTime = 0;
    }
}

// Navegación inteligente según ubicación
function navigate(id) {
    const isInsideProgramas = window.location.pathname.includes('/programas/');
    const path = isInsideProgramas ? `${id}.html` : `programas/${id}.html`;
    window.location.href = path;
}

// Inicializar Carrusel de Home
function initProgramCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = PROGRAMAS_DATA.map(p => createProgramCard(p)).join('');
}

// Inicializar Grid de Hub
function initProgramGrid(containerId, filter = 'Todos') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = filter === 'Todos'
        ? PROGRAMAS_DATA
        : PROGRAMAS_DATA.filter(p => p.categoria === filter);

    container.innerHTML = filtered.map(p => createProgramCard(p)).join('');
}

// Setup Chips de Filtro
function setupFilters(containerId, gridId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = ['Todos', ...new Set(PROGRAMAS_DATA.map(p => p.categoria))];

    container.innerHTML = categories.map(cat => `
        <div class="chip ${cat === 'Todos' ? 'active' : ''}" onclick="changeFilter(this, '${cat}', '${gridId}')">${cat}</div>
    `).join('');
}

function changeFilter(el, cat, gridId) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    initProgramGrid(gridId, cat);
}
