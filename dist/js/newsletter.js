/**
 * Newsletter UI Controller
 * Handles newsletter subscription form
 */

(function () {
    'use strict';

    const NewsletterUI = {
        init() {
            const form = document.getElementById('newsletter-form');
            if (!form) return;

            form.addEventListener('submit', this.handleSubmit.bind(this));
        },

        async handleSubmit(e) {
            e.preventDefault();

            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const messageEl = document.getElementById('newsletter-message');

            // Get form data
            const email = form.querySelector('#newsletter-email').value;
            const frequency = form.querySelector('input[name="frequency"]:checked')?.value;
            const topics = Array.from(form.querySelectorAll('input[name="topics"]:checked')).map(cb => cb.value);
            const consent = form.querySelector('#newsletter-consent').checked;
            const honeypot = form.querySelector('#newsletter-hp').value;

            // Validation
            if (!email || !frequency || topics.length === 0 || !consent) {
                this.showMessage(messageEl, 'Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Suscribiendo...';

            try {
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, frequency, topics, consent, honeypot })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.showMessage(messageEl, data.message || 'Revisa tu correo para confirmar tu suscripción', 'success');
                    form.reset();
                } else {
                    this.showMessage(messageEl, data.error || 'Error al suscribirse', 'error');
                }
            } catch (error) {
                this.showMessage(messageEl, 'Error de conexión. Intenta nuevamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Suscribirme';
            }
        },

        showMessage(el, message, type) {
            if (!el) return;
            el.textContent = message;
            el.className = `newsletter-message ${type}`;
            el.style.display = 'block';

            setTimeout(() => {
                el.style.display = 'none';
            }, 5000);
        }
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NewsletterUI.init());
    } else {
        NewsletterUI.init();
    }

    window.NewsletterUI = NewsletterUI;
})();
