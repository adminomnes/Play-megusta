/**
 * World Map UI Controller
 * Handles interactive world news map with Leaflet.js
 */

(function () {
    'use strict';

    const MapUI = {
        map: null,
        markers: {},
        currentTopic: 'world',

        // Country coordinates (major countries)
        countries: {
            'US': { lat: 37.0902, lng: -95.7129, name: 'Estados Unidos' },
            'GB': { lat: 55.3781, lng: -3.4360, name: 'Reino Unido' },
            'FR': { lat: 46.2276, lng: 2.2137, name: 'Francia' },
            'DE': { lat: 51.1657, lng: 10.4515, name: 'Alemania' },
            'ES': { lat: 40.4637, lng: -3.7492, name: 'España' },
            'IT': { lat: 41.8719, lng: 12.5674, name: 'Italia' },
            'RU': { lat: 61.5240, lng: 105.3188, name: 'Rusia' },
            'CN': { lat: 35.8617, lng: 104.1954, name: 'China' },
            'JP': { lat: 36.2048, lng: 138.2529, name: 'Japón' },
            'IN': { lat: 20.5937, lng: 78.9629, name: 'India' },
            'BR': { lat: -14.2350, lng: -51.9253, name: 'Brasil' },
            'AR': { lat: -38.4161, lng: -63.6167, name: 'Argentina' },
            'CL': { lat: -35.6751, lng: -71.5430, name: 'Chile' },
            'MX': { lat: 23.6345, lng: -102.5528, name: 'México' },
            'CA': { lat: 56.1304, lng: -106.3468, name: 'Canadá' },
            'AU': { lat: -25.2744, lng: 133.7751, name: 'Australia' },
            'ZA': { lat: -30.5595, lng: 22.9375, name: 'Sudáfrica' },
            'EG': { lat: 26.8206, lng: 30.8025, name: 'Egipto' },
            'NG': { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
            'KR': { lat: 35.9078, lng: 127.7669, name: 'Corea del Sur' }
        },

        async init() {
            const mapContainer = document.getElementById('world-map');
            if (!mapContainer) return;

            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
                console.error('Leaflet.js not loaded');
                return;
            }

            // Initialize map
            this.map = L.map('world-map', {
                center: [20, 0],
                zoom: 2,
                minZoom: 2,
                maxZoom: 6,
                scrollWheelZoom: true
            });

            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Add markers for countries
            this.addCountryMarkers();

            // Setup topic selector
            const topicBtns = document.querySelectorAll('.map-topic-btn');
            topicBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    topicBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentTopic = e.target.dataset.topic;
                });
            });
        },

        addCountryMarkers() {
            Object.entries(this.countries).forEach(([code, data]) => {
                const marker = L.circleMarker([data.lat, data.lng], {
                    radius: 8,
                    fillColor: '#cc0000',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
                }).addTo(this.map);

                // Hover effect
                marker.on('mouseover', async (e) => {
                    e.target.setStyle({ radius: 12, fillOpacity: 1 });
                    await this.showCountryTooltip(code, data.name, e.target);
                });

                marker.on('mouseout', (e) => {
                    e.target.setStyle({ radius: 8, fillOpacity: 0.7 });
                });

                // Click to filter news
                marker.on('click', () => {
                    this.filterNewsByCountry(code, data.name);
                });

                this.markers[code] = marker;
            });
        },

        async showCountryTooltip(countryCode, countryName, marker) {
            try {
                const response = await fetch(`/api/map/trends?country=${countryCode}&topic=${this.currentTopic}`);
                const data = await response.json();

                let tooltipContent = `<div class="map-tooltip">
                    <h4>${countryName}</h4>`;

                if (data.top && data.top.length > 0) {
                    tooltipContent += '<ul>';
                    data.top.slice(0, 5).forEach(article => {
                        tooltipContent += `<li><a href="${article.link}" target="_blank">${article.title}</a></li>`;
                    });
                    tooltipContent += '</ul>';
                } else {
                    tooltipContent += '<p>No hay noticias disponibles</p>';
                }

                tooltipContent += '</div>';

                marker.bindPopup(tooltipContent, {
                    maxWidth: 300,
                    className: 'custom-popup'
                }).openPopup();

            } catch (error) {
                console.error('Failed to fetch country trends:', error);
            }
        },

        filterNewsByCountry(countryCode, countryName) {
            // This would integrate with the main news grid
            // For now, just show an alert
            alert(`Filtrando noticias de ${countryName}. Esta función se integrará con el grid principal.`);

            // You could emit a custom event here that the main news.js listens to
            const event = new CustomEvent('filterByCountry', {
                detail: { countryCode, countryName }
            });
            document.dispatchEvent(event);
        }
    };

    // Auto-initialize when Leaflet is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a bit for Leaflet to load
            setTimeout(() => MapUI.init(), 500);
        });
    } else {
        setTimeout(() => MapUI.init(), 500);
    }

    window.MapUI = MapUI;
})();
