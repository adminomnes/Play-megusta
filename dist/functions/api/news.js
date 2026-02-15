/**
 * Professional News API - Hybrid RSS/API Aggregation
 * Cloudflare Pages Function
 * 
 * Features:
 * - 17 RSS feeds (international + Chile)
 * - GNews API fallback
 * - Edge caching (300s)
 * - Individual error handling
 * - Deduplication
 * - Never returns 500
 */

// RSS Feed Sources
const RSS_FEEDS = {
    world: [
        'https://feeds.bbci.co.uk/mundo/rss.xml',
        'https://rss.dw.com/rdf/rss-es-all',
        'https://www.france24.com/es/rss',
        'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada',
        'https://cnnespanol.cnn.com/feed/',
        'https://www.rtve.es/rss/noticias.xml'
    ],
    tech: [
        'https://www.xataka.com/index.xml',
        'https://www.genbeta.com/index.xml',
        'https://hipertextual.com/feed'
    ],
    music: [
        'https://los40.com/feed/',
        'https://www.europafm.com/rss/',
        'https://www.billboard.com/feed/'
    ],
    chile: [
        'https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml',
        'https://www.latercera.com/feed/',
        'https://www.biobiochile.cl/feed/',
        'https://www.emol.com/rss/emol.xml',
        'https://www.24horas.cl/rss'
    ]
};

// Parse RSS/Atom feed with timeout protection
async function fetchAndParseRSS(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'PlayMeGusta-NewsBot/1.0' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) return [];

        const text = await response.text();
        const items = [];

        // Parse RSS items
        const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);
        for (const match of itemMatches) {
            const item = match[1];

            const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim();
            const link = item.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s)?.[1]?.trim();
            const description = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s)?.[1]?.trim();
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim();
            const dcDate = item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1]?.trim();

            // Try to extract image
            let imageUrl = item.match(/<media:content[^>]*url="([^"]+)"/)?.[1];
            if (!imageUrl) imageUrl = item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];
            if (!imageUrl) imageUrl = item.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];

            // Extract source from URL
            let source = 'Desconocido';
            try {
                const urlObj = new URL(link || url);
                const hostname = urlObj.hostname.replace('www.', '');
                source = hostname.split('.')[0].toUpperCase();
            } catch { }

            if (title && link) {
                items.push({
                    title: cleanHTML(title),
                    link,
                    summary: description ? cleanHTML(description).slice(0, 200) : '',
                    source,
                    publishedAt: parseDate(pubDate || dcDate),
                    imageUrl: imageUrl || null
                });
            }
        }

        // Also try entry format (Atom)
        const entryMatches = text.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
        for (const match of entryMatches) {
            const entry = match[1];

            const title = entry.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s)?.[1]?.trim();
            const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1];
            const summary = entry.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/s)?.[1]?.trim();
            const content = entry.match(/<content[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content>/s)?.[1]?.trim();
            const updated = entry.match(/<updated>(.*?)<\/updated>/)?.[1]?.trim();
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim();

            let source = 'Desconocido';
            try {
                const urlObj = new URL(link || url);
                source = urlObj.hostname.replace('www.', '').split('.')[0].toUpperCase();
            } catch { }

            if (title && link) {
                items.push({
                    title: cleanHTML(title),
                    link,
                    summary: (summary || content) ? cleanHTML(summary || content).slice(0, 200) : '',
                    source,
                    publishedAt: parseDate(published || updated),
                    imageUrl: null
                });
            }
        }

        return items;
    } catch (error) {
        console.error(`RSS fetch failed for ${url}:`, error.message);
        return [];
    }
}

// Fetch from GNews API as fallback
async function fetchGNewsAPI(topic, apiKey, limit = 60) {
    if (!apiKey) return [];

    try {
        const categoryMap = {
            world: 'general',
            tech: 'technology',
            music: 'entertainment',
            chile: 'general'
        };

        const category = categoryMap[topic] || 'general';
        const country = topic === 'chile' ? 'cl' : '';
        const lang = 'es';

        let url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&max=${limit}&apikey=${apiKey}`;
        if (country) url += `&country=${country}`;

        const response = await fetch(url, {
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) return [];

        const data = await response.json();

        return (data.articles || []).map(article => ({
            title: article.title,
            link: article.url,
            summary: article.description || '',
            source: article.source?.name || 'GNews',
            publishedAt: article.publishedAt,
            imageUrl: article.image || null
        }));
    } catch (error) {
        console.error('GNews API failed:', error.message);
        return [];
    }
}

// Clean HTML tags and entities
function cleanHTML(str) {
    if (!str) return '';
    return str
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

// Parse various date formats to ISO
function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();

    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    } catch { }

    return new Date().toISOString();
}

// Deduplicate by link
function deduplicateByLink(items) {
    const seen = new Set();
    return items.filter(item => {
        if (!item.link || seen.has(item.link)) return false;
        seen.add(item.link);
        return true;
    });
}

// Main handler
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300' // 5 minutes edge cache
    };

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    // Get parameters
    const topic = url.searchParams.get('topic') || 'world';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '60'), 120);

    // Validate topic
    if (!['world', 'tech', 'music', 'chile'].includes(topic)) {
        return new Response(JSON.stringify([]), { headers });
    }

    try {
        // Fetch from all RSS feeds in parallel
        const feeds = RSS_FEEDS[topic] || RSS_FEEDS.world;
        const rssResults = await Promise.all(
            feeds.map(feed => fetchAndParseRSS(feed))
        );

        // Flatten and combine
        let allItems = rssResults.flat();

        // If RSS returned less than 40 items, use GNews API as fallback
        if (allItems.length < 40 && env.GNEWS_API_KEY) {
            console.log(`RSS returned only ${allItems.length} items, fetching from GNews...`);
            const gNewsItems = await fetchGNewsAPI(topic, env.GNEWS_API_KEY, limit);
            allItems = [...allItems, ...gNewsItems];
        }

        // Validate, deduplicate, sort, and limit
        const validItems = allItems.filter(item => item.title && item.link);
        const uniqueItems = deduplicateByLink(validItems);
        const sortedItems = uniqueItems.sort((a, b) =>
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        const finalItems = sortedItems.slice(0, limit);

        console.log(`Returning ${finalItems.length} news items for topic: ${topic}`);

        return new Response(JSON.stringify(finalItems), { headers });

    } catch (error) {
        console.error('News API error:', error);
        // Never return 500, always return valid JSON
        return new Response(JSON.stringify([]), { headers });
    }
}
