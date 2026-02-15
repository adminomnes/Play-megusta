/**
 * Newsletter Send Endpoint (Cron Triggered)
 * POST /api/newsletter/send
 * 
 * Scheduled execution:
 * - Daily: 0 12 * * * (09:00 Chile = 12:00 UTC)
 * - Weekly: 0 12 * * 1 (Monday 09:00 Chile)
 * 
 * Fetches top news and sends to active subscribers
 */

import { createClient } from '@supabase/supabase-js';

// Fetch top news from API
async function fetchTopNews(topic, limit = 10) {
    try {
        const response = await fetch(`https://play.radiomegusta.cl/api/news?topic=${topic}&limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch news for ${topic}:`, error);
        return [];
    }
}

// Build HTML email template
function buildNewsletterHTML(subscriber, newsData, unsubscribeUrl) {
    const topicNames = {
        world: 'Mundo',
        chile: 'Chile',
        tech: 'Tecnología',
        music: 'Música'
    };

    const frequencyText = subscriber.frequency === 'daily' ? 'Diario' : 'Semanal';

    let sectionsHTML = '';

    for (const topic of subscriber.topics) {
        const topicNews = newsData[topic] || [];
        if (topicNews.length === 0) continue;

        const topicName = topicNames[topic] || topic;

        sectionsHTML += `
        <div style="margin-bottom: 40px;">
            <h2 style="color: #cc0000; font-size: 1.5rem; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #cc0000;">
                ${topicName}
            </h2>
            ${topicNews.slice(0, 5).map(article => `
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; line-height: 1.4;">
                        <a href="${article.link}" style="color: #0a0a0a; text-decoration: none;">${article.title}</a>
                    </h3>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9rem; line-height: 1.5;">
                        ${article.summary || ''}
                    </p>
                    <div style="font-size: 0.85rem; color: #999;">
                        <span style="font-weight: 600; color: #cc0000;">${article.source}</span>
                        ${article.publishedAt ? ` • ${new Date(article.publishedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    }

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter ${frequencyText} | Play Me Gusta</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Outfit', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a0a0a 0%, #262626 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 2rem; font-weight: 900;">
                                Play Me Gusta
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                                Newsletter ${frequencyText} • ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 30px 0; color: #333; font-size: 1rem; line-height: 1.6;">
                                Hola,<br><br>
                                Aquí están las noticias más relevantes para ti:
                            </p>
                            
                            ${sectionsHTML}
                            
                            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e5e5;">
                                <a href="https://play.radiomegusta.cl/noticias.html" 
                                   style="display: inline-block; background: #cc0000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 0.95rem;">
                                    Ver Más Noticias
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8f8f8; padding: 30px; text-align: center; font-size: 0.85rem; color: #777;">
                            <p style="margin: 0 0 10px 0;">
                                Estás recibiendo este correo porque te suscribiste al newsletter ${frequencyText.toLowerCase()} de Play Me Gusta.
                            </p>
                            <p style="margin: 0 0 20px 0;">
                                <a href="${unsubscribeUrl}" style="color: #cc0000; text-decoration: none;">
                                    Darse de baja
                                </a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 0.8rem;">
                                © ${new Date().getFullYear()} Play Me Gusta. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// Send email via MailChannels
async function sendEmail(to, subject, html) {
    const emailData = {
        personalizations: [{
            to: [{ email: to }]
        }],
        from: {
            email: 'news@radiomegusta.cl',
            name: 'Play Me Gusta'
        },
        subject,
        content: [{
            type: 'text/html',
            value: html
        }]
    };

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    return response.ok;
}

export async function onRequest(context) {
    const { request, env } = context;

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    // Only allow POST (triggered by cron or manual)
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }

    try {
        // Get frequency from query param (daily or weekly)
        const url = new URL(request.url);
        const frequency = url.searchParams.get('frequency') || 'daily';

        if (!['daily', 'weekly'].includes(frequency)) {
            return new Response(JSON.stringify({ error: 'Invalid frequency' }), {
                status: 400,
                headers
            });
        }

        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Get active subscribers for this frequency
        const { data: subscribers, error: fetchError } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('active', true)
            .eq('frequency', frequency);

        if (fetchError) {
            console.error('Failed to fetch subscribers:', fetchError);
            return new Response(JSON.stringify({ error: 'Failed to fetch subscribers' }), {
                status: 500,
                headers
            });
        }

        if (!subscribers || subscribers.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No active subscribers for this frequency',
                sent: 0
            }), { headers });
        }

        // Fetch news for all topics
        const allTopics = ['world', 'chile', 'tech', 'music'];
        const newsData = {};

        await Promise.all(
            allTopics.map(async (topic) => {
                newsData[topic] = await fetchTopNews(topic, 10);
            })
        );

        // Send to each subscriber
        let sentCount = 0;
        let failedCount = 0;

        for (const subscriber of subscribers) {
            try {
                const unsubscribeUrl = `https://play.radiomegusta.cl/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`;
                const html = buildNewsletterHTML(subscriber, newsData, unsubscribeUrl);

                const subject = frequency === 'daily'
                    ? `Noticias del Día | Play Me Gusta`
                    : `Resumen Semanal | Play Me Gusta`;

                const sent = await sendEmail(subscriber.email, subject, html);

                // Log the send
                await supabase
                    .from('newsletter_logs')
                    .insert({
                        email: subscriber.email,
                        frequency,
                        topics: subscriber.topics,
                        status: sent ? 'sent' : 'failed',
                        meta: { newsCount: subscriber.topics.reduce((sum, t) => sum + (newsData[t]?.length || 0), 0) }
                    });

                if (sent) {
                    sentCount++;
                } else {
                    failedCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Failed to send to ${subscriber.email}:`, error);
                failedCount++;

                // Log the failure
                await supabase
                    .from('newsletter_logs')
                    .insert({
                        email: subscriber.email,
                        frequency,
                        topics: subscriber.topics,
                        status: 'error',
                        meta: { error: error.message }
                    });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            frequency,
            total: subscribers.length,
            sent: sentCount,
            failed: failedCount
        }), { headers });

    } catch (error) {
        console.error('Newsletter send error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers
        });
    }
}
