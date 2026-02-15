/**
 * Service to consume RMG internal audience charts
 */
const CHARTS_CONFIG = {
    // This value should be updated based on actual worker URL
    BASE_URL: 'https://rmg-api.radiomegusta.workers.dev'
};

async function fetchInternalCharts(scope, type) {
    // SCOPE = LATAM | SA | NA | EU | AS | AF | OC
    // TYPE = tracks | artists
    try {
        const endpoint = `${CHARTS_CONFIG.BASE_URL}/charts/${scope}_${type}_week`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching internal charts:', error);
        return null;
    }
}
