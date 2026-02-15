/**
 * Service Worker for Web Push Notifications
 * Handles push events and notification clicks
 */

const CACHE_NAME = 'news-portal-v1';

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(clients.claim());
});

// Push event - receive and display notification
self.addEventListener('push', (event) => {
    console.log('Push received:', event);

    let data = {
        title: 'Nueva Noticia',
        body: 'Tienes noticias nuevas disponibles',
        icon: '/assets/icon-192.png',
        badge: '/assets/badge-72.png',
        url: '/noticias.html'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.error('Failed to parse push data:', e);
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/assets/icon-192.png',
        badge: data.badge || '/assets/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/noticias.html',
            dateOfArrival: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Leer Ahora'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ],
        requireInteraction: false,
        tag: 'news-notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/noticias.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes('/noticias') && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Fetch event (optional caching)
self.addEventListener('fetch', (event) => {
    // Let requests pass through without caching for now
    event.respondWith(fetch(event.request));
});
