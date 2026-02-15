/**
 * Professional News Portal - Frontend Engine
 * State management, rendering, and user interactions
 */

(function () {
    'use strict';

    // Application State
    const state = {
        topic: 'world',
        allNews: [],
        displayCount: 20,
        searchQuery: '',
        isLoading: false,
        lastUpdate: null
    };

    // Configuration
    const CONFIG = {
        API_ENDPOINT: 'api/news',
        REFRESH_INTERVAL: 600000, // 10 minutes
        INITIAL_DISPLAY: 20,
        LOAD_MORE_INCREMENT: 20,
        MAX_DISPLAY: 120
    };

    // Initialize
    async function init() {
        console.log('🗞️ Initializing Professional News Portal...');

        setupEventListeners();
        await loadNews();
        renderAll();

        // Auto-refresh every 10 minutes
        setInterval(async () => {
            console.log('🔄 Auto-refreshing news...');
            await loadNews();
            renderAll();
        }, CONFIG.REFRESH_INTERVAL);

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Topic tabs
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const topic = e.target.dataset.topic;
                if (topic && topic !== state.topic) {
                    switchTopic(topic);
                }
            });
        });

        // Search input
        const searchInput = document.getElementById('news-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                state.searchQuery = e.target.value.toLowerCase().trim();
                state.displayCount = CONFIG.INITIAL_DISPLAY;
                renderMainGrid();
            }, 300));
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                state.displayCount = Math.min(
                    state.displayCount + CONFIG.LOAD_MORE_INCREMENT,
                    CONFIG.MAX_DISPLAY
                );
                renderMainGrid();
            });
        }

        // Carousel navigation
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const carousel = document.getElementById('trending-carousel');

        if (prevBtn && carousel) {
            prevBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: -340, behavior: 'smooth' });
            });
        }

        if (nextBtn && carousel) {
            nextBtn.addEventListener('click', () => {
                carousel.scrollBy({ left: 340, behavior: 'smooth' });
            });
        }
    }

    // Switch Topic
    async function switchTopic(newTopic) {
        state.topic = newTopic;
        state.displayCount = CONFIG.INITIAL_DISPLAY;
        state.searchQuery = '';

        // Update active tab
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.topic === newTopic);
        });

        // Clear search
        const searchInput = document.getElementById('news-search');
        if (searchInput) searchInput.value = '';

        await loadNews();
        renderAll();
    }

    // Load News from API
    async function loadNews() {
        state.isLoading = true;

        try {
            const url = `${CONFIG.API_ENDPOINT}?topic=${state.topic}&limit=120&_t=${Date.now()}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                state.allNews = data || [];
                state.lastUpdate = new Date();
                console.log(`✅ Loaded ${state.allNews.length} news items for topic: ${state.topic}`);
            } else {
                console.error('❌ Failed to load news:', response.status);
                state.allNews = [];
            }
        } catch (error) {
            console.error('❌ Error loading news:', error);
            state.allNews = [];
        } finally {
            state.isLoading = false;
        }
    }

    // Render All Sections
    function renderAll() {
        renderHero();
        renderTrendingCarousel();
        renderChileSection();
        renderMainGrid();
        renderSidebarRanking();
        updateLastUpdateIndicator();
    }

    // Render Hero Section
    function renderHero() {
        const container = document.getElementById('hero-news');
        if (!container || state.allNews.length === 0) return;

        const latest = state.allNews[0];
        const imageUrl = latest.imageUrl || getDefaultImage();

        container.innerHTML = `
            <img src="${imageUrl}" alt="${escapeHTML(latest.title)}" class="hero-news-image">
            <div class="hero-news-overlay"></div>
            <div class="hero-news-content">
                <span class="hero-news-category">${escapeHTML(latest.source)}</span>
                <h1 class="hero-news-title">${escapeHTML(latest.title)}</h1>
                <div class="hero-news-meta">
                    <span class="hero-news-source">${escapeHTML(latest.source)}</span>
                    <span class="hero-news-date">${formatDate(latest.publishedAt)}</span>
                </div>
                <button class="hero-news-btn" onclick="window.NewsPortal.openArticle(0)">
                    Leer Noticia
                    <i data-lucide="arrow-right"></i>
                </button>
            </div>
        `;

        container.onclick = () => openArticle(0);

        if (window.lucide) lucide.createIcons();
    }

    // Render Trending Carousel
    function renderTrendingCarousel() {
        const container = document.getElementById('trending-carousel');
        if (!container || state.allNews.length === 0) return;

        const trending = state.allNews.slice(1, 11); // Items 2-11

        container.innerHTML = trending.map((item, index) => {
            const imageUrl = item.imageUrl || getDefaultImage();
            const actualIndex = index + 1;

            return `
                <div class="trending-card" onclick="window.NewsPortal.openArticle(${actualIndex})">
                    <img src="${imageUrl}" alt="${escapeHTML(item.title)}" class="trending-card-image">
                    <div class="trending-card-content">
                        <div class="trending-card-source">${escapeHTML(item.source)}</div>
                        <h3 class="trending-card-title">${escapeHTML(item.title)}</h3>
                        <div class="trending-card-date">${formatDate(item.publishedAt)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render Chile Section
    function renderChileSection() {
        const container = document.getElementById('chile-section');
        if (!container) return;

        // Only show Chile section when topic is Chile
        if (state.topic !== 'chile') {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        if (state.allNews.length === 0) return;

        const mainArticle = state.allNews[0];
        const secondaryArticles = state.allNews.slice(1, 5);

        const mainImageUrl = mainArticle.imageUrl || getDefaultImage();

        const mainHTML = `
            <div class="chile-main" onclick="window.NewsPortal.openArticle(0)">
                <img src="${mainImageUrl}" alt="${escapeHTML(mainArticle.title)}" class="chile-main-image">
                <div class="chile-main-overlay"></div>
                <div class="chile-main-content">
                    <span class="hero-news-category">${escapeHTML(mainArticle.source)}</span>
                    <h2 class="chile-main-title">${escapeHTML(mainArticle.title)}</h2>
                    <div class="hero-news-meta">
                        <span class="hero-news-source">${escapeHTML(mainArticle.source)}</span>
                        <span class="hero-news-date">${formatDate(mainArticle.publishedAt)}</span>
                    </div>
                </div>
            </div>
        `;

        const secondaryHTML = `
            <div class="chile-secondary-grid">
                ${secondaryArticles.map((item, index) => {
            const imageUrl = item.imageUrl || getDefaultImage();
            const actualIndex = index + 1;

            return `
                        <div class="chile-secondary-card" onclick="window.NewsPortal.openArticle(${actualIndex})">
                            <img src="${imageUrl}" alt="${escapeHTML(item.title)}" class="chile-secondary-image">
                            <div class="chile-secondary-content">
                                <h4 class="chile-secondary-title">${escapeHTML(item.title)}</h4>
                                <div class="chile-secondary-source">${escapeHTML(item.source)}</div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        container.innerHTML = mainHTML + secondaryHTML;
    }

    // Render Main News Grid
    function renderMainGrid() {
        const container = document.getElementById('news-grid');
        const loadMoreContainer = document.getElementById('load-more-container');

        if (!container) return;

        // Filter by search query
        let filtered = state.allNews;
        if (state.searchQuery) {
            filtered = state.allNews.filter(item =>
                item.title.toLowerCase().includes(state.searchQuery) ||
                (item.summary && item.summary.toLowerCase().includes(state.searchQuery))
            );
        }

        // Skip items already shown in hero/trending/chile
        const startIndex = state.topic === 'chile' ? 5 : 11;
        const gridItems = filtered.slice(startIndex, startIndex + state.displayCount);

        if (gridItems.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <h3 style="font-size: 1.5rem; color: var(--news-gray-700);">No se encontraron noticias</h3>
                    <p style="color: var(--news-gray-700); margin-top: 10px;">Intenta con otra búsqueda o categoría</p>
                </div>
            `;
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        container.innerHTML = gridItems.map((item, index) => {
            const imageUrl = item.imageUrl || getDefaultImage();
            const actualIndex = startIndex + index;

            return `
                <div class="news-card" onclick="window.NewsPortal.openArticle(${actualIndex})">
                    <img src="${imageUrl}" alt="${escapeHTML(item.title)}" class="news-card-image">
                    <div class="news-card-content">
                        <div class="news-card-source">${escapeHTML(item.source)}</div>
                        <h3 class="news-card-title">${escapeHTML(item.title)}</h3>
                        <p class="news-card-summary">${escapeHTML(item.summary || '')}</p>
                        <div class="news-card-footer">
                            <span class="news-card-date">${formatDate(item.publishedAt)}</span>
                            <span class="news-card-read-more">Leer más</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Show/hide load more button
        if (loadMoreContainer) {
            const hasMore = (startIndex + state.displayCount) < filtered.length && state.displayCount < CONFIG.MAX_DISPLAY;
            loadMoreContainer.style.display = hasMore ? 'block' : 'none';
        }
    }

    // Render Sidebar Ranking
    function renderSidebarRanking() {
        const container = document.getElementById('ranking-list');
        if (!container || state.allNews.length === 0) return;

        // Top 10 most recent
        const top10 = state.allNews.slice(0, 10);

        container.innerHTML = top10.map((item, index) => `
            <div class="ranking-item" onclick="window.NewsPortal.openArticle(${index})">
                <div class="ranking-number">${String(index + 1).padStart(2, '0')}</div>
                <div class="ranking-content">
                    <div class="ranking-item-source">${escapeHTML(item.source)}</div>
                    <h4 class="ranking-item-title">${escapeHTML(item.title)}</h4>
                </div>
            </div>
        `).join('');
    }

    // Update Last Update Indicator
    function updateLastUpdateIndicator() {
        const indicator = document.getElementById('last-update');
        if (!indicator || !state.lastUpdate) return;

        const minutesAgo = Math.floor((new Date() - state.lastUpdate) / 60000);
        const text = minutesAgo === 0 ? 'Actualizado ahora' : `Actualizado hace ${minutesAgo} min`;

        indicator.textContent = text;
    }

    // Open Article in Modal
    function openArticle(index) {
        const article = state.allNews[index];
        if (!article) return;

        const modal = document.getElementById('news-modal');
        const modalContent = document.getElementById('modal-content');

        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <h1 class="modal-article-title">${escapeHTML(article.title)}</h1>
            <div class="modal-article-meta">
                <span class="news-card-source">${escapeHTML(article.source)}</span>
                <span class="news-card-date">${formatDate(article.publishedAt)}</span>
            </div>
            <div class="modal-article-body">
                <p>${escapeHTML(article.summary || '')}</p>
                <p style="margin-top: 30px;">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" 
                       style="display: inline-flex; align-items: center; gap: 8px; color: var(--news-red); font-weight: 700; text-decoration: none;">
                        Leer artículo completo en ${escapeHTML(article.source)}
                        <i data-lucide="external-link"></i>
                    </a>
                </p>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (window.lucide) lucide.createIcons();
    }

    // Close Modal
    function closeModal() {
        const modal = document.getElementById('news-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Utility: Debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility: Escape HTML
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Utility: Format Date
    function formatDate(dateStr) {
        if (!dateStr) return '';

        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 60) return `Hace ${diffMins} min`;
            if (diffHours < 24) return `Hace ${diffHours}h`;
            if (diffDays < 7) return `Hace ${diffDays}d`;

            return date.toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return '';
        }
    }

    // Utility: Get Default Image
    function getDefaultImage() {
        return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&q=80`;
    }

    // Public API
    window.NewsPortal = {
        init,
        openArticle,
        closeModal
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
