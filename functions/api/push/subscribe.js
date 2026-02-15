/**
 * Push Subscription Endpoint
 * POST /api/push/subscribe
 * 
 * Stores push subscription from browser
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
        const { subscription, topics } = body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return new Response(JSON.stringify({ error: 'Invalid subscription data' }), {
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

        // Check if subscription already exists
        const { data: existing } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', subscription.endpoint)
            .single();

        if (existing) {
            // Update existing subscription
            const { error } = await supabase
                .from('push_subscriptions')
                .update({
                    topics,
                    active: true,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                })
                .eq('endpoint', subscription.endpoint);

            if (error) {
                console.error('Update error:', error);
                return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
                    status: 500,
                    headers
                });
            }
        } else {
            // Insert new subscription
            const { error } = await supabase
                .from('push_subscriptions')
                .insert({
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    topics,
                    active: true
                });

            if (error) {
                console.error('Insert error:', error);
                return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
                    status: 500,
                    headers
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Push subscription saved successfully'
        }), { headers });

    } catch (error) {
        console.error('Push subscribe error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers
        });
    }
}
