import { authService } from '../src/services/authService.js'

export const authGuard = {
    // Verificar si el usuario es Admin
    async checkAdmin() {
        const session = await authService.getSession()
        if (!session) {
            window.location.href = 'login.html'
            return null
        }

        const profile = await authService.getCurrentProfile()
        if (!profile || profile.role !== 'admin') {
            this.showAccessDenied('No tienes permisos de administrador.')
            return null
        }
        return profile
    },

    // Verificar si está en modo infantil y proteger rutas de adultos
    async checkKidsAccess() {
        const profileMode = localStorage.getItem('play_profile_mode');
        const isKids = profileMode === 'kids';

        // Si estamos en una ruta de adultos y el modo es Kids, bloqueamos
        const adultPaths = ['play.html', 'admin.html', 'programas/', 'tv-en-vivo.html'];
        const currentPath = window.location.pathname;

        if (isKids && adultPaths.some(path => currentPath.includes(path))) {
            this.showKidsRestricted();
            return false;
        }
        return true;
    },

    // UI de Acceso Denegado Estándar
    showAccessDenied(message) {
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#000; color:#fff; font-family:'Outfit', sans-serif;">
                <h1 style="color:#ff0055; font-weight:900;">ACCESO RESTRINGIDO</h1>
                <p style="opacity:0.7;">${message}</p>
                <a href="index.html" style="color:#1db954; text-decoration:none; margin-top:20px; font-weight:bold; border: 1px solid #1db954; padding: 10px 25px; border-radius: 50px;">Volver al Inicio</a>
            </div>
        `;
    },

    // UI de Restricción Infantil (Elegante)
    showKidsRestricted() {
        document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#A1C4FD; color:#1a1a1a; font-family:'Outfit', sans-serif; text-align:center; padding: 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
                <h1 style="font-weight:900; color: #1a2a4a; margin-bottom: 10px;">¡Ups! Zona de Adultos</h1>
                <p style="font-size: 1.2rem; max-width: 500px; line-height: 1.6; opacity: 0.8; margin-bottom: 30px;">
                    Este contenido no está disponible en el perfil infantil. Por favor, vuelve a tu zona segura para seguir divirtiéndote.
                </p>
                <a href="globinobys.html" style="background:#4D96FF; color:#fff; text-decoration:none; font-weight:bold; padding: 18px 40px; border-radius: 50px; box-shadow: 0 10px 25px rgba(77, 150, 255, 0.4);">Ir a Globinobys</a>
            </div>
        `;
    }
}
