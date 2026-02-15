/**
 * Newsletter Unsubscribe Endpoint
 * GET /api/newsletter/unsubscribe?token=...
 * 
 * Deactivates subscription using unsubscribe token
 */

import { createClient } from '@supabase/supabase-js';

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
        .secondary-button {
            display: inline-block;
            background: #f0f0f0;
            color: #333;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-left: 10px;
            transition: background 0.3s;
        }
        .secondary-button:hover {
            background: #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">${success ? '👋' : '❌'}</div>
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
            'No se proporcionó un token de cancelación válido.',
            false
        );
    }

    try {
        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Deactivate subscription
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .update({ active: false })
            .eq('unsubscribe_token', token)
            .eq('active', true)
            .select()
            .single();

        if (error || !data) {
            return htmlResponse(
                'Error',
                'No se pudo procesar la cancelación. Es posible que ya estés dado de baja o que el enlace sea inválido.',
                false
            );
        }

        return htmlResponse(
            'Suscripción Cancelada',
            `Has sido dado de baja exitosamente del newsletter de Play Me Gusta. Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte desde nuestro portal de noticias.`
        );

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return htmlResponse(
            'Error',
            'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
            false
        );
    }
}
