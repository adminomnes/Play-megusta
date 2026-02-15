/**
 * Push Send Endpoint (Cron Triggered)
 * POST /api/push/send
 * 
 * Scheduled execution: every 30 minutes
 * Cron: */30 * * * *
 * 
 * NOTE: This requires web - push library which needs to be bundled
    * For Cloudflare Pages, you'll need to use a bundler (esbuild/webpack)
        * or deploy as a Cloudflare Worker with the web - push package
            */

import { createClient } from '@supabase/supabase-js';

// Store seen article hashes (in-memory, resets on cold start)
const seenArticles = new Set();

// Simple hash function
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Fetch latest news
async function fetchLatestNews() {
    try {
        const topics = ['world', 'chile'];
        const allNews = [];

        for (const topic of topics) {
            const response = await fetch(`https://play.radiomegusta.cl/api/news?topic=${topic}&limit=20`);
            if (response.ok) {
                const news = await response.json();
                allNews.push(...news.slice(0, 3).map(n => ({ ...n, topic })));
            }
        }

        return allNews;
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return [];
    }
}

// Send push notification using Web Push API
// NOTE: This is a placeholder - actual implementation requires web-push library
async function sendPushNotification(subscription, payload, vapidKeys) {
    // This would normally use the web-push library:
    // const webpush = require('web-push');
    // webpush.setVapidDetails(vapidKeys.subject, vapidKeys.publicKey, vapidKeys.privateKey);
    // await webpush.sendNotification(subscriptionObject, JSON.stringify(payload));

    // For now, return a mock success
    // You'll need to implement this with a proper web-push library
    console.log('Would send push to:', subscription.endpoint);
    console.log('Payload:', payload);
    return true;
}

export async function onRequest(context) {
    const { request, env } = context;

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }

    try {
        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Fetch latest news
        const latestNews = await fetchLatestNews();

        if (latestNews.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No new articles to send',
                sent: 0
            }), { headers });
        }

        // Filter out already seen articles
        const newArticles = latestNews.filter(article => {
            const hash = hashString(article.link);
            if (seenArticles.has(hash)) return false;
            seenArticles.add(hash);
            return true;
        });

        if (newArticles.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No new unseen articles',
                sent: 0
            }), { headers });
        }

        // Limit to 3 articles max
        const articlesToSend = newArticles.slice(0, 3);

        // Get active subscriptions
        const { data: subscriptions, error: fetchError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('active', true);

        if (fetchError || !subscriptions || subscriptions.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No active subscriptions',
                sent: 0
            }), { headers });
        }

        const now = new Date();
        const vapidKeys = {
            subject: env.VAPID_SUBJECT || 'mailto:radiomegustacl@gmail.com',
            publicKey: env.VAPID_PUBLIC_KEY,
            privateKey: env.VAPID_PRIVATE_KEY
        };

        let sentCount = 0;
        let failedCount = 0;

        for (const sub of subscriptions) {
            try {
                // Reset daily count if needed (24h window)
                const lastReset = new Date(sub.last_reset_at);
                const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

                if (hoursSinceReset >= 24) {
                    await supabase
                        .from('push_subscriptions')
                        .update({
                            daily_count: 0,
                            last_reset_at: now.toISOString()
                        })
                        .eq('id', sub.id);

                    sub.daily_count = 0;
                }

                // Check daily limit (3 per day)
                if (sub.daily_count >= 3) {
                    continue;
                }

                // Filter articles by user's topics
                const relevantArticles = articlesToSend.filter(article =>
                    sub.topics.includes(article.topic)
                );

                if (relevantArticles.length === 0) {
                    continue;
                }

                // Send notification for first relevant article
                const article = relevantArticles[0];
                const payload = {
                    title: article.title,
                    body: article.summary || `Nueva noticia de ${article.source}`,
                    icon: article.imageUrl || '/assets/icon-192.png',
                    badge: '/assets/badge-72.png',
                    url: article.link
                };

                const subscriptionObject = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                const sent = await sendPushNotification(subscriptionObject, payload, vapidKeys);

                if (sent) {
                    // Update daily count and last sent
                    await supabase
                        .from('push_subscriptions')
                        .update({
                            daily_count: sub.daily_count + 1,
                            last_sent_at: now.toISOString()
                        })
                        .eq('id', sub.id);

                    sentCount++;
                } else {
                    failedCount++;
                }

            } catch (error) {
                console.error(`Failed to send push to ${sub.endpoint}:`, error);

                // If 410 or 404, deactivate subscription
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await supabase
                        .from('push_subscriptions')
                        .update({ active: false })
                        .eq('id', sub.id);
                }

                failedCount++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            newArticles: articlesToSend.length,
            sent: sentCount,
            failed: failedCount
        }), { headers });

    } catch (error) {
        console.error('Push send error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers
        });
    }
}
