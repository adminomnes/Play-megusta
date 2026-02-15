export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const topic = searchParams.get('topic') || 'world';

    // Configurable feeds by topic
    const feedsByTopic = {
        world: [
            { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', source: 'BBC Mundo' },
            { url: 'https://www.dw.com/es/top-stories/s-9097?maca=es-rss-es-all-1119-rdf', source: 'DW Español' },
            { url: 'https://www.france24.com/es/rss', source: 'France 24' }
        ],
        tech: [
            { url: 'https://www.xataka.com/index.xml', source: 'Xataka' },
            { url: 'https://www.genbeta.com/index.xml', source: 'Genbeta' },
            { url: 'https://hipertextual.com/feed', source: 'Hipertextual' }
        ],
        music: [
            { url: 'https://los40.com/feed/', source: 'Los40' },
            { url: 'https://www.europafm.com/rss/', source: 'EuropaFM' }
        ]
    };

    const targetFeeds = feedsByTopic[topic] || feedsByTopic.world;

    // Fetch and parse feeds
    const allItems = [];
    const fetchPromises = targetFeeds.map(async (feed) => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(feed.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) return;
            const xml = await response.text();

            const parsed = parseRSS(xml, feed.source);
            allItems.push(...parsed);
        } catch (e) {
            console.error(`Error fetching ${feed.url}:`, e);
        }
    });

    await Promise.all(fetchPromises);

    // Deduplicate and Sort
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.link, item])).values());
    uniqueItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const finalItems = uniqueItems.slice(0, 20);

    return new Response(JSON.stringify(finalItems), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 's-maxage=300'
        }
    });
}

function parseRSS(xml, defaultSource) {
    const items = [];
    const entries = xml.split(/<item|<entry/);

    for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];

        const title = extractTag(entry, 'title').replace(/<!\[CDATA\[(.*?)]]>/g, '$1').trim();
        const link = (extractTag(entry, 'link', 'href') || extractTag(entry, 'link')).replace(/<!\[CDATA\[(.*?)]]>/g, '$1').trim();
        const rawDate = extractTag(entry, 'pubDate') || extractTag(entry, 'updated') || extractTag(entry, 'dc:date');

        if (!title || !link || !rawDate) continue;

        let publishedAt;
        try {
            const d = new Date(rawDate);
            if (isNaN(d.getTime())) continue;
            publishedAt = d.toISOString();
        } catch (e) { continue; }

        const description = extractTag(entry, 'description') || extractTag(entry, 'summary') || '';

        let imageUrl = null;
        const mediaMatch = entry.match(/<(media:content|enclosure)[^>]+url=["']([^"']+)["']/i);
        if (mediaMatch) imageUrl = mediaMatch[2];

        if (!imageUrl) {
            const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
        }

        const summary = description
            .replace(/<[^>]*>/g, '')
            .replace(/&[a-z0-9]+;/gi, ' ')
            .trim()
            .substring(0, 200);

        items.push({
            title,
            link,
            source: defaultSource,
            publishedAt,
            imageUrl,
            summary: summary + (summary.length >= 200 ? '...' : '')
        });
    }
    return items;
}

function extractTag(text, tag, attribute = null) {
    if (attribute) {
        const regex = new RegExp(`<${tag}[^>]+${attribute}=["']([^"']+)["']`, 'i');
        const match = text.match(regex);
        return match ? match[1] : '';
    }
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'is');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
}
