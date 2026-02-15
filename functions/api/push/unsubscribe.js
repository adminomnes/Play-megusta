/**
 * Push Unsubscribe Endpoint
 * POST /api/push/unsubscribe
 * 
 * Deactivates push subscription
 */

import { createClient } from '@supabase/supabase-js';

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
        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return new Response(JSON.stringify({ error: 'Endpoint is required' }), {
                status: 400,
                headers
            });
        }

        // Initialize Supabase
        const supabase = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_KEY
        );

        // Deactivate subscription
        const { error } = await supabase
            .from('push_subscriptions')
            .update({ active: false })
            .eq('endpoint', endpoint);

        if (error) {
            console.error('Unsubscribe error:', error);
            return new Response(JSON.stringify({ error: 'Failed to unsubscribe' }), {
                status: 500,
                headers
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Push notifications disabled successfully'
        }), { headers });

    } catch (error) {
        console.error('Push unsubscribe error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers
        });
    }
}
