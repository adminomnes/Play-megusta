/**
 * A11Y Layer - Radio Me Gusta
 * Logic for International Accessibility (WCAG 2.1 AA) - AUTOMATED VERSION
 */

document.addEventListener('DOMContentLoaded', () => {
    initA11y();
});

function initA11y() {
    // 1. Ensure Main Container ID (Automated)
    ensureMainId();

    // 2. Create Aria Live Announcer
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.className = 'aria-announcer';
    announcer.setAttribute('aria-live', 'polite');
    document.body.appendChild(announcer);

    // 3. Accessibility Widget
    createA11yWidget();

    // 4. Load Saved Preferences
    loadA11yPreferences();

    // 5. Global Keyboard Handling
    handleGlobalKeyboard();

    // 6. Player Keyboard Shortcuts
    initPlayerA11y();

    // 7. Initial Enhancement
    autoEnhanceElements(document.body);

    // 8. WATCH FOR DYNAMIC CONTENT (Automation Engine)
    setupAutomationObserver();
}

/**
 * Automatically ensures an element with id="main" exists for the skip link.
 * If not found, it tries to label the <main> tag or the first large container.
 */
function ensureMainId() {
    if (!document.getElementById('main')) {
        const mainTag = document.querySelector('main');
        if (mainTag) {
            mainTag.id = 'main';
        } else {
            // Fallback to first section or div inside body that isn't nav/header
            const container = document.querySelector('body > section, body > div:not(.navbar):not(.hero):not(.aurora-container)');
            if (container) container.id = 'main';
        }
    }
}

/**
 * MutationObserver to handle dynamic content (Netflix-style carousels, etc.)
 */
function setupAutomationObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    autoEnhanceElements(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Smart Scanner: Automatically adds A11Y attributes to plain elements
 */
function autoEnhanceElements(root) {
    // A. Find clickable DIVs/IMGs that should be buttons
    const clickables = root.querySelectorAll('[onclick], [style*="cursor: pointer"], .btn, .card, .song-card, .program-card');
    clickables.forEach(el => {
        const tag = el.tagName;
        if (tag !== 'BUTTON' && tag !== 'A' && tag !== 'INPUT') {
            if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
            if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

            // Try to guess a label if empty
            if (!el.hasAttribute('aria-label')) {
                const title = el.querySelector('h1, h2, h3, h4, .title, .name');
                if (title) el.setAttribute('aria-label', title.innerText);
                else if (el.title) el.setAttribute('aria-label', el.title);
            }
        }
    });

    // B. Ensure images have alt or aria-hidden
    const images = root.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            img.setAttribute('alt', ''); // Decorative by default if no alt provided
        }
    });

    // C. Enhance existing labels for social links if found
    const socialLinks = root.querySelectorAll('.social-links a, .nav-actions a');
    socialLinks.forEach(link => {
        const icon = link.querySelector('i, svg');
        if (icon && !link.hasAttribute('aria-label')) {
            const label = icon.getAttribute('data-lucide') || icon.classList.toString() || 'Enlace';
            link.setAttribute('aria-label', `Ir a ${label}`);
        }
    });
}

/**
 * Announces messages to screen readers
 */
window.announceToScreenReader = (message) => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
};

function handleGlobalKeyboard() {
    document.addEventListener('keydown', (e) => {
        const target = e.target;

        // Support for Enter/Space on role="button"
        if (target.getAttribute('role') === 'button' || target.hasAttribute('tabindex')) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
                    e.preventDefault();
                    target.click();
                }
            }
        }

        // ESC to close modals/panels
        if (e.key === 'Escape') {
            const activePanel = document.querySelector('.a11y-panel.active');
            if (activePanel) {
                toggleA11yPanel();
            }
        }
    });
}

function createA11yWidget() {
    if (document.getElementById('a11y-widget-container')) return;

    const widgetHTML = `
        <button class="a11y-widget-btn" id="a11y-widget-trigger" aria-label="Menú de accesibilidad" aria-expanded="false" aria-controls="a11y-panel">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
        </button>
        <div class="a11y-panel" id="a11y-panel" role="region" aria-label="Opciones de accesibilidad">
            <h2>Accesibilidad</h2>
            
            <div class="a11y-control">
                <label>Tamaño de texto</label>
                <div class="a11y-btn-group">
                    <button class="a11y-option-btn" data-font="1">A</button>
                    <button class="a11y-option-btn" data-font="2">A+</button>
                    <button class="a11y-option-btn" data-font="3">A++</button>
                </div>
            </div>

            <div class="a11y-control">
                <button class="a11y-toggle-btn" id="toggle-contrast" aria-pressed="false">
                    <span>Alto Contraste</span>
                    <div class="switch"></div>
                </button>
            </div>

            <div class="a11y-control">
                <button class="a11y-toggle-btn" id="toggle-motion" aria-pressed="false">
                    <span>Reducir Movimiento</span>
                    <div class="switch"></div>
                </button>
            </div>

            <button class="a11y-reset-btn" id="a11y-reset">Restablecer ajustes</button>
        </div>
    `;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'a11y-widget-container';
    widgetContainer.innerHTML = widgetHTML;
    document.body.appendChild(widgetContainer);

    document.getElementById('a11y-widget-trigger').onclick = toggleA11yPanel;

    document.querySelectorAll('.a11y-option-btn').forEach(btn => {
        btn.onclick = () => setFontScale(btn.getAttribute('data-font'));
    });

    document.getElementById('toggle-contrast').onclick = () => {
        const isActive = document.documentElement.classList.toggle('a11y-contrast');
        updateToggleButton('toggle-contrast', isActive);
        savePreference('contrast', isActive);
        announceToScreenReader(isActive ? "Contraste alto activo" : "Contraste normal activo");
    };

    document.getElementById('toggle-motion').onclick = () => {
        const isActive = document.documentElement.classList.toggle('a11y-reduce-motion');
        updateToggleButton('toggle-motion', isActive);
        savePreference('motion', isActive);
        announceToScreenReader(isActive ? "Movimiento reducido" : "Movimiento normal");
    };

    document.getElementById('a11y-reset').onclick = resetA11y;
}

function updateToggleButton(id, active) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.setAttribute('aria-pressed', active);
    btn.classList.toggle('active', active);
}

function toggleA11yPanel() {
    const panel = document.getElementById('a11y-panel');
    const trigger = document.getElementById('a11y-widget-trigger');
    const isVisible = panel.classList.toggle('active');
    trigger.setAttribute('aria-expanded', isVisible);
    if (isVisible) {
        panel.querySelector('button').focus();
        trapFocus(panel);
    } else {
        trigger.focus();
    }
}

function setFontScale(level) {
    document.documentElement.classList.remove('a11y-font-1', 'a11y-font-2', 'a11y-font-3');
    document.documentElement.classList.add(`a11y-font-${level}`);
    document.querySelectorAll('.a11y-option-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-font') === level);
    });
    savePreference('fontLevel', level);
}

function trapFocus(element) {
    const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    element.onkeydown = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                last.focus(); e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus(); e.preventDefault();
            }
        }
    };
}

function savePreference(key, value) {
    const prefs = JSON.parse(localStorage.getItem('a11y_prefs') || '{}');
    prefs[key] = value;
    localStorage.setItem('a11y_prefs', JSON.stringify(prefs));
}

function loadA11yPreferences() {
    const prefs = JSON.parse(localStorage.getItem('a11y_prefs') || '{}');
    if (prefs.fontLevel) setFontScale(prefs.fontLevel);
    else setFontScale('1');

    if (prefs.contrast) {
        document.documentElement.classList.add('a11y-contrast');
        updateToggleButton('toggle-contrast', true);
    }
    if (prefs.motion) {
        document.documentElement.classList.add('a11y-reduce-motion');
        updateToggleButton('toggle-motion', true);
    }
}

function resetA11y() {
    document.documentElement.classList.remove('a11y-contrast', 'a11y-reduce-motion', 'a11y-font-1', 'a11y-font-2', 'a11y-font-3');
    localStorage.removeItem('a11y_prefs');
    loadA11yPreferences();
    announceToScreenReader("Ajustes restablecidos");
}

function initPlayerA11y() {
    // Player controls support
    const controls = {
        play: document.getElementById('radio-toggle'),
        audio: document.getElementById('audio-player'),
        vol: document.getElementById('radio-volume')
    };

    if (controls.play && controls.audio) {
        controls.play.addEventListener('click', () => {
            setTimeout(() => {
                const playing = !controls.audio.paused;
                controls.play.setAttribute('aria-pressed', playing);
                announceToScreenReader(playing ? "Reproduciendo" : "Pausado");
            }, 200);
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (controls.play) controls.play.click();
                break;
            case 'ArrowUp':
                if (controls.vol) {
                    e.preventDefault();
                    controls.vol.value = Math.min(1, parseFloat(controls.vol.value) + 0.1);
                    controls.vol.dispatchEvent(new Event('input'));
                    announceToScreenReader(`Volumen ${Math.round(controls.vol.value * 100)}%`);
                }
                break;
            case 'ArrowDown':
                if (controls.vol) {
                    e.preventDefault();
                    controls.vol.value = Math.max(0, parseFloat(controls.vol.value) - 0.1);
                    controls.vol.dispatchEvent(new Event('input'));
                    announceToScreenReader(`Volumen ${Math.round(controls.vol.value * 100)}%`);
                }
                break;
        }
    });
}
