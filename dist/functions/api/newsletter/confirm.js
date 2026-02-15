/**
 * Newsletter Confirmation Endpoint
 * GET /api/newsletter/confirm?token=...
 * 
 * Verifies signed token and activates subscription
 */

import { createClient } from '@supabase/supabase-js';

// Verify token
async function verifyToken(token) {
    try {
        const [payloadB64, signatureHex] = token.split('.');
        if (!payloadB64 || !signatureHex) return null;

        const payload = JSON.parse(atob(payloadB64));

        // Check expiration
        if (payload.exp < Date.now()) {
            return null;
        }

        // Verify signature
        const secret = process.env.NEWSLETTER_SIGNING_SECRET || 'default-secret-change-me';
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = new Uint8Array(signatureHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            encoder.encode(payloadB64)
        );

        if (!isValid) return null;

        return payload;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    // HTML response helper
    const htmlResponse = (title, message, success = true) => {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Play Me Gusta</title>
    <style>
        body {
            font-family: 'Outfit', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            padding: 40px;
            text-align: center;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 16px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            background: #cc0000;
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .button:hover {
            background: #a00000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">${success ? '✅' : '❌'}</div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="/noticias.html" class="button">Ir al Portal de Noticias</a>
    </div>
</body>
</html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    };

    if (!token) {
        return htmlResponse(
            'Token Inválido',
            'No se proporcionó un token de confirmación válido.',
            false
        );
    }

    try {
        // Verify token
        const payload = await verifyToken(token);

        if (!payload || !payload.email) {
            return htmlResponse(
                'Token Expirado',
                'El enlace de confirmación ha expirado o es inválido. Por favor, suscríbete nuevamente.',
                false
            );
        }

        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Activate subscription
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .update({
                active: true,
                confirmed_at: new Date().toISOString()
            })
            .eq('email', payload.email)
            .eq('active', false)
            .select()
            .single();

        if (error || !data) {
            return htmlResponse(
                'Error',
                'No se pudo confirmar la suscripción. Es posible que ya esté confirmada o que el correo no exista.',
                false
            );
        }

        return htmlResponse(
            '¡Suscripción Confirmada!',
            `Tu suscripción al newsletter de Play Me Gusta ha sido confirmada exitosamente. Recibirás noticias ${data.frequency === 'daily' ? 'diariamente' : 'semanalmente'} sobre los temas que seleccionaste.`
        );

    } catch (error) {
        console.error('Confirmation error:', error);
        return htmlResponse(
            'Error',
            'Ocurrió un error al procesar tu confirmación. Por favor, intenta nuevamente.',
            false
        );
    }
}
