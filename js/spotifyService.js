/**
 * Service to fetch Spotify metadata through a secure proxy
 */
const SPOTIFY_CONFIG = {
    // Your Cloudflare Worker URL acting as proxy
    PROXY_URL: 'https://spotify-proxy.radiomegusta.workers.dev'
};

const spotifyService = {
    async getTrack(id) {
        return this._fetch(`/spotify/track/${id}`);
    },

    async getArtist(id) {
        return this._fetch(`/spotify/artist/${id}`);
    },

    async _fetch(endpoint) {
        try {
            const response = await fetch(`${SPOTIFY_CONFIG.PROXY_URL}${endpoint}`);
            if (!response.ok) throw new Error('Spotify Proxy error');
            return await response.json();
        } catch (error) {
            console.error('Spotify Service Error:', error);
            return null;
        }
    }
};
