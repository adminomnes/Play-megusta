/**
 * Play Me Gusta News API
 * Robust RSS Aggregator with Static Fallback
 */

// Emergency content in case RSS fails (Guaranteed Content)
const STATIC_NEWS = [
    {
        title: "Inteligencia Artificial: La nueva era de la música digital",
        summary: "Descubre cómo los algoritmos están redefiniendo la producción y el consumo de música en plataformas de streaming.",
        source: "PlayTech",
        publishedAt: new Date().toISOString(),
        link: "#",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
    },
    {
        title: "El futuro del cine: Streaming vs Salas tradicionales",
        summary: "Un análisis profundo sobre las tendencias de consumo audiovisual en la era post-digital.",
        source: "CineWorld",
        publishedAt: new Date().toISOString(),
        link: "#",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"
    },
    {
        title: "Chile se posiciona como líder en energías renovables",
        summary: "El país andino rompe récords en generación solar y eólica, marcando el camino para Latinoamérica.",
        source: "EcoNews",
        publishedAt: new Date().toISOString(),
        link: "#",
        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80"
    },
    {
        title: "Top 10: Las series más esperadas de 2026",
        summary: "Desde spin-offs galácticos hasta dramas históricos, estas son las producciones que no te puedes perder.",
        source: "ShowBiz",
        publishedAt: new Date().toISOString(),
        link: "#",
        imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80"
    }
];

// Reliable RSS Sources
const RSS_SOURCES = [
    'https://feeds.bbci.co.uk/mundo/rss.xml',       // BBC Mundo
    'https://rss.dw.com/rdf/rss-es-all',             // DW Español
    'https://techcrunch.com/feed/',                  // TechCrunch
    'https://www.latercera.com/feed/',               // La Tercera (Chile)
    'https://www.cooperativa.cl/noticias/site/tax/port/all/rss____1.xml' // Cooperativa
];

async function fetchRSS(url) {
    try {
        // Fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

        const res = await fetch(url, {
            headers: { 'User-Agent': 'PlayMeGusta/1.0' },
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) return [];
        const text = await res.text();

        // Simple regex parse (lighter than XML parser)
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(text)) !== null) {
            const itemStr = match[1];
            const title = itemStr.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1];
            const link = itemStr.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/)?.[1];
            const desc = itemStr.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)?.[1];
            const date = itemStr.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

            // Try extract image
            let img = itemStr.match(/url="([^"]+\.(?:jpg|jpeg|png|webp))"/)?.[1];
            if (!img) img = itemStr.match(/<media:content[^>]*url="([^"]+)"/)?.[1];

            if (title && link) {
                items.push({
                    title: cleanText(title),
                    summary: cleanText(desc || '').slice(0, 150) + '...',
                    link,
                    publishedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
                    source: new URL(url).hostname.replace('www.', '').split('.')[0].toUpperCase(),
                    imageUrl: img || null
                });
            }
        }
        return items.slice(0, 5); // Take top 5 from each feed
    } catch (e) {
        return [];
    }
}

function cleanText(text) {
    return text
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .trim();
}

export async function onRequest(context) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600' // Cache 10 mins
    };

    try {
        const promises = RSS_SOURCES.map(url => fetchRSS(url));
        const results = await Promise.all(promises);

        // Flatten and sort
        let news = results.flat().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        // Filter valid
        news = news.filter(n => n.title && n.summary);

        // If very few news (network error?), append FALLBACK
        if (news.length < 5) {
            console.log("Using fallback news due to shortage");
            news = [...news, ...STATIC_NEWS];
        }

        // Deduplicate by title
        const uniqueNews = [];
        const seen = new Set();
        for (const item of news) {
            if (!seen.has(item.title)) {
                seen.add(item.title);
                uniqueNews.push(item);
            }
        }

        return new Response(JSON.stringify(uniqueNews), { headers });

    } catch (e) {
        // Absolute fail-safe: Return Static News
        return new Response(JSON.stringify(STATIC_NEWS), { headers });
    }
}
