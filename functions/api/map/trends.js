/**
 * World Map Trends Endpoint
 * GET /api/map/trends?country=CL&topic=world
 * 
 * Returns top news for a specific country
 */

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=600' // 10 minutes cache
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    const country = url.searchParams.get('country') || 'US';
    const topic = url.searchParams.get('topic') || 'world';

    // Validate country code (ISO 2-letter)
    if (!/^[A-Z]{2}$/.test(country)) {
        return new Response(JSON.stringify({ error: 'Invalid country code' }), {
            status: 400,
            headers
        });
    }

    // Validate topic
    if (!['world', 'tech', 'music', 'chile'].includes(topic)) {
        return new Response(JSON.stringify({ error: 'Invalid topic' }), {
            status: 400,
            headers
        });
    }

    try {
        const apiKey = env.GNEWS_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                country,
                topic,
                top: []
            }), { headers });
        }

        // Map topics to GNews categories
        const categoryMap = {
            world: 'general',
            tech: 'technology',
            music: 'entertainment',
            chile: 'general'
        };

        const category = categoryMap[topic] || 'general';

        // Fetch from GNews API
        const gNewsUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=es&country=${country}&max=5&apikey=${apiKey}`;

        const response = await fetch(gNewsUrl, {
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return new Response(JSON.stringify({
                country,
                topic,
                top: []
            }), { headers });
        }

        const data = await response.json();

        const articles = (data.articles || []).map(article => ({
            title: article.title,
            link: article.url,
            summary: article.description || '',
            source: article.source?.name || 'Unknown',
            publishedAt: article.publishedAt,
            imageUrl: article.image || null
        }));

        return new Response(JSON.stringify({
            country,
            topic,
            top: articles
        }), { headers });

    } catch (error) {
        console.error('Map trends error:', error);
        return new Response(JSON.stringify({
            country,
            topic,
            top: []
        }), { headers });
    }
}
