(function () {
    window.FlowController = {
        // Configuración de rutas
        ROUTES: {
            LOGIN: 'index.html',
            PROFILES: 'profiles.html',
            ADULT_HOME: 'play.html',
            KIDS_HOME: 'globinobys.html'
        },

        // Estado de Autenticación
        isAuthenticated() {
            return localStorage.getItem('play_authenticated') === 'true';
        },

        login() {
            localStorage.setItem('play_authenticated', 'true');
            this.redirectTo(this.ROUTES.PROFILES);
        },

        logout() {
            localStorage.removeItem('play_authenticated');
            localStorage.removeItem('play_profile_mode');
            this.redirectTo(this.ROUTES.LOGIN);
        },

        // Gestión de Perfiles
        getProfileMode() {
            return localStorage.getItem('play_profile_mode');
        },

        setProfileMode(mode) {
            if (mode !== 'adult' && mode !== 'kids') {
                console.error('Modo de perfil inválido:', mode);
                return;
            }
            localStorage.setItem('play_profile_mode', mode);

            if (mode === 'kids') {
                this.redirectTo(this.ROUTES.KIDS_HOME);
            } else {
                this.redirectTo(this.ROUTES.ADULT_HOME);
            }
        },

        // Protección de Rutas
        checkAccess() {
            const currentPath = window.location.pathname;
            const isAuth = this.isAuthenticated();
            const profileMode = this.getProfileMode();

            // 1. Si no está autenticado y no está en login -> Login
            if (!isAuth && !currentPath.includes('index.html') && !currentPath.includes('login.html') && !currentPath.includes('landing.html') && !currentPath.includes('reset-cache.html')) {
                // Permitir landing como entrada
                if (currentPath.endsWith('/') || currentPath.endsWith('\\')) return; // Home root
                this.redirectTo(this.ROUTES.LOGIN);
                return;
            }

            // 2. Si está en login pero ya está autenticado -> Perfiles (o Home según perfil)
            if (isAuth && (currentPath.includes('index.html') || currentPath.includes('login.html') || currentPath.includes('landing.html'))) {
                if (profileMode) {
                    this.redirectTo(profileMode === 'kids' ? this.ROUTES.KIDS_HOME : this.ROUTES.ADULT_HOME);
                } else {
                    this.redirectTo(this.ROUTES.PROFILES);
                }
                return;
            }

            // 3. Protección de Modo Kids (No puede ver play.html)
            if (profileMode === 'kids' && (currentPath.includes('play.html') || currentPath.includes('admin.html'))) {
                this.showKidsLockScreen();
            }
        },

        // Utilidades - Adapta a paths locales
        redirectTo(page) {
            // Evitar redirección cíclica
            if (!window.location.href.includes(page)) {
                // Manejo especial para file://
                const pathParts = window.location.pathname.split('/');
                pathParts.pop(); // quitar archivo actual
                const newPath = pathParts.join('/') + '/' + page;

                // Si estamos en file://, usamos href relativo simple
                window.location.href = page;
            }
        },

        showKidsLockScreen() {
            document.body.innerHTML = `
                <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#A1C4FD; color:#1a2a4a; font-family:'Outfit', sans-serif; text-align:center;">
                    <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
                    <h1 style="font-size: 2.5rem; margin-bottom: 15px;">¡Zona de Adultos!</h1>
                    <p style="font-size: 1.2rem; margin-bottom: 30px;">Vuelve a tu zona segura para seguir jugando.</p>
                    <button onclick="window.location.href='globinobys.html'" style="padding: 15px 30px; border-radius: 50px; background: #4D96FF; color: white; border: none; font-weight: bold; font-size: 1rem; cursor: pointer; box-shadow: 0 10px 20px rgba(77,150,255,0.3);">Ir a Globinobys</button>
                </div>
            `;
        }
    };
})();

// Auto-ejecutar checkeo al importar (opcional, pero útil para protección inmediata)
// FlowController.checkAccess();
