/**
 * Newsletter Subscription Endpoint
 * POST /api/newsletter/subscribe
 * 
 * Features:
 * - Email validation
 * - Honeypot anti-spam
 * - Rate limiting
 * - Double opt-in (sends confirmation email)
 */

import { createClient } from '@supabase/supabase-js';

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

// Clean old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        if (now - data.resetAt > 300000) {
            rateLimitStore.delete(ip);
        }
    }
}, 300000);

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generate secure token
async function generateToken(data) {
    const secret = process.env.NEWSLETTER_SIGNING_SECRET || 'default-secret-change-me';
    const payload = JSON.stringify({ ...data, exp: Date.now() + 86400000 }); // 24h expiry

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
    );

    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return btoa(payload) + '.' + signatureHex;
}

// Generate unsubscribe token
function generateUnsubscribeToken() {
    return crypto.randomUUID();
}

// Send confirmation email via MailChannels
async function sendConfirmationEmail(email, confirmToken, topics, frequency) {
    const confirmUrl = `https://play.radiomegusta.cl/api/newsletter/confirm?token=${confirmToken}`;

    const topicNames = {
        world: 'Mundo',
        chile: 'Chile',
        tech: 'Tecnología',
        music: 'Música'
    };

    const selectedTopics = topics.map(t => topicNames[t] || t).join(', ');
    const frequencyText = frequency === 'daily' ? 'Diaria' : 'Semanal';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Outfit', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0a0a0a; color: white; padding: 30px; text-align: center; }
        .header img { height: 50px; }
        .content { background: #f8f8f8; padding: 30px; }
        .button { display: inline-block; background: #cc0000; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 0.9rem; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Play Me Gusta</h1>
            <p>Portal de Noticias</p>
        </div>
        <div class="content">
            <h2>¡Confirma tu suscripción!</h2>
            <p>Hola,</p>
            <p>Gracias por suscribirte al newsletter de Play Me Gusta. Para completar tu suscripción, por favor confirma tu correo electrónico haciendo clic en el botón de abajo:</p>
            
            <p style="text-align: center;">
                <a href="${confirmUrl}" class="button">Confirmar Suscripción</a>
            </p>
            
            <p><strong>Detalles de tu suscripción:</strong></p>
            <ul>
                <li>Frecuencia: ${frequencyText}</li>
                <li>Temas: ${selectedTopics}</li>
            </ul>
            
            <p>Si no solicitaste esta suscripción, puedes ignorar este correo.</p>
            
            <p style="font-size: 0.85rem; color: #777;">
                Este enlace expira en 24 horas.
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Play Me Gusta. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;

    const emailData = {
        personalizations: [{
            to: [{ email }]
        }],
        from: {
            email: 'news@radiomegusta.cl',
            name: 'Play Me Gusta'
        },
        subject: 'Confirma tu suscripción al Newsletter',
        content: [{
            type: 'text/html',
            value: htmlContent
        }]
    };

    // Send via MailChannels (Cloudflare)
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }

    try {
        // Get client IP for rate limiting
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

        // Rate limiting: 5 requests per minute per IP
        const now = Date.now();
        const rateLimitData = rateLimitStore.get(clientIP) || { count: 0, resetAt: now + 60000 };

        if (now > rateLimitData.resetAt) {
            rateLimitData.count = 0;
            rateLimitData.resetAt = now + 60000;
        }

        if (rateLimitData.count >= 5) {
            return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
                status: 429,
                headers
            });
        }

        rateLimitData.count++;
        rateLimitStore.set(clientIP, rateLimitData);

        // Parse request body
        const body = await request.json();
        const { email, frequency, topics, consent, honeypot } = body;

        // Honeypot check (should be empty)
        if (honeypot) {
            return new Response(JSON.stringify({ error: 'Invalid submission' }), {
                status: 400,
                headers
            });
        }

        // Validation
        if (!email || !isValidEmail(email)) {
            return new Response(JSON.stringify({ error: 'Invalid email address' }), {
                status: 400,
                headers
            });
        }

        if (!consent) {
            return new Response(JSON.stringify({ error: 'Consent is required' }), {
                status: 400,
                headers
            });
        }

        if (!frequency || !['daily', 'weekly'].includes(frequency)) {
            return new Response(JSON.stringify({ error: 'Invalid frequency' }), {
                status: 400,
                headers
            });
        }

        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one topic is required' }), {
                status: 400,
                headers
            });
        }

        const validTopics = ['world', 'chile', 'tech', 'music'];
        if (!topics.every(t => validTopics.includes(t))) {
            return new Response(JSON.stringify({ error: 'Invalid topics' }), {
                status: 400,
                headers
            });
        }

        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Check if email already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, active')
            .eq('email', email)
            .single();

        if (existing) {
            if (existing.active) {
                return new Response(JSON.stringify({ error: 'Email already subscribed' }), {
                    status: 400,
                    headers
                });
            } else {
                // Resend confirmation
                const confirmToken = await generateToken({ email });
                await sendConfirmationEmail(email, confirmToken, topics, frequency);

                return new Response(JSON.stringify({
                    success: true,
                    message: 'Confirmation email resent. Please check your inbox.'
                }), { headers });
            }
        }

        // Generate tokens
        const confirmToken = await generateToken({ email });
        const unsubscribeToken = generateUnsubscribeToken();

        // Insert subscriber (inactive until confirmed)
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email,
                frequency,
                topics,
                active: false,
                unsubscribe_token: unsubscribeToken
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
                status: 500,
                headers
            });
        }

        // Send confirmation email
        const emailSent = await sendConfirmationEmail(email, confirmToken, topics, frequency);

        if (!emailSent) {
            console.error('Failed to send confirmation email');
            // Don't fail the request, subscriber is created
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Subscription created! Please check your email to confirm.'
        }), { headers });

    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers
        });
    }
}
