/**
 * Push Notifications UI Controller
 * Handles web push subscription
 */

(function () {
    'use strict';

    const PushUI = {
        vapidPublicKey: null, // Will be set from environment

        async init() {
            // Check if service workers are supported
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.log('Push notifications not supported');
                return;
            }

            // Get VAPID public key (you'll need to add this to the page)
            const keyEl = document.getElementById('vapid-public-key');
            if (keyEl) {
                this.vapidPublicKey = keyEl.value;
            }

            // Setup event listeners
            const enableBtn = document.getElementById('push-enable-btn');
            const disableBtn = document.getElementById('push-disable-btn');

            if (enableBtn) {
                enableBtn.addEventListener('click', () => this.enablePush());
            }

            if (disableBtn) {
                disableBtn.addEventListener('click', () => this.disablePush());
            }

            // Check current status
            await this.updateStatus();
        },

        async updateStatus() {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                const statusEl = document.getElementById('push-status');
                const enableBtn = document.getElementById('push-enable-btn');
                const disableBtn = document.getElementById('push-disable-btn');

                if (subscription) {
                    if (statusEl) statusEl.textContent = 'Activas';
                    if (enableBtn) enableBtn.style.display = 'none';
                    if (disableBtn) disableBtn.style.display = 'inline-block';
                } else {
                    if (statusEl) statusEl.textContent = 'Desactivadas';
                    if (enableBtn) enableBtn.style.display = 'inline-block';
                    if (disableBtn) disableBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Failed to check push status:', error);
            }
        },

        async enablePush() {
            try {
                // Request notification permission
                const permission = await Notification.requestPermission();

                if (permission !== 'granted') {
                    alert('Necesitas permitir las notificaciones para continuar');
                    return;
                }

                // Register service worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                // Get selected topics
                const topics = Array.from(document.querySelectorAll('input[name="push-topics"]:checked'))
                    .map(cb => cb.value);

                if (topics.length === 0) {
                    alert('Selecciona al menos un tema');
                    return;
                }

                // Subscribe to push
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
                });

                // Send subscription to server
                const response = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscription: subscription.toJSON(),
                        topics
                    })
                });

                if (response.ok) {
                    alert('¡Notificaciones activadas exitosamente!');
                    await this.updateStatus();
                } else {
                    alert('Error al activar notificaciones');
                }

            } catch (error) {
                console.error('Failed to enable push:', error);
                alert('Error al activar notificaciones');
            }
        },

        async disablePush() {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    // Unsubscribe from server
                    await fetch('/api/push/unsubscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            endpoint: subscription.endpoint
                        })
                    });

                    // Unsubscribe from browser
                    await subscription.unsubscribe();
                }

                alert('Notificaciones desactivadas');
                await this.updateStatus();

            } catch (error) {
                console.error('Failed to disable push:', error);
                alert('Error al desactivar notificaciones');
            }
        },

        urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PushUI.init());
    } else {
        PushUI.init();
    }

    window.PushUI = PushUI;
})();
