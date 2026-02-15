
(function () {
    window.ProfileManager = {
        // Activar modo kids
        setKidsMode() {
            if (window.FlowController) window.FlowController.setProfileMode('kids');
        },

        // Activar modo adulto (requiere PIN)
        setAdultMode(pin) {
            // En una app real, verificarías esto contra Supabase
            const correctPin = "1234";

            if (pin === correctPin) {
                if (window.FlowController) window.FlowController.setProfileMode('adult');
                return true;
            } else {
                return false;
            }
        },

        // Obtener modo actual
        getCurrentMode() {
            return localStorage.getItem('play_profile_mode') || 'adult';
        },

        // UI para salir de modo Kids (Modal de PIN)
        showPinModal() {
            const modal = document.createElement('div');
            modal.id = 'pinModal';
            modal.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000; font-family: 'Outfit', sans-serif;
        `;

            modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 40px; text-align: center; width: 90%; max-width: 400px; box-shadow: 0 30px 60px rgba(0,0,0,0.3);">
                <h2 style="color: #1a1a1a; margin-bottom: 10px; font-weight: 900;">Acceso Parental</h2>
                <p style="color: #666; margin-bottom: 25px;">Ingresa tu código de 4 dígitos para salir de Globinobys.</p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px;">
                    <input type="password" id="p1" maxlength="1" style="width: 50px; height: 60px; text-align: center; font-size: 24px; border: 2px solid #ddd; border-radius: 12px; outline: none;">
                    <input type="password" id="p2" maxlength="1" style="width: 50px; height: 60px; text-align: center; font-size: 24px; border: 2px solid #ddd; border-radius: 12px; outline: none;">
                    <input type="password" id="p3" maxlength="1" style="width: 50px; height: 60px; text-align: center; font-size: 24px; border: 2px solid #ddd; border-radius: 12px; outline: none;">
                    <input type="password" id="p4" maxlength="1" style="width: 50px; height: 60px; text-align: center; font-size: 24px; border: 2px solid #ddd; border-radius: 12px; outline: none;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="cancelPin" style="flex:1; padding: 15px; border-radius: 15px; border: none; background: #f0f0f0; color: #555; cursor: pointer; font-weight: 800;">Cancelar</button>
                    <button id="confirmPin" style="flex:1; padding: 15px; border-radius: 15px; border: none; background: #4D96FF; color: white; cursor: pointer; font-weight: 800;">Entrar</button>
                </div>
                <p id="pinError" style="color: #FF6B6B; margin-top: 15px; display: none; font-weight: 700;">PIN incorrecto. Intenta de nuevo.</p>
            </div>
        `;

            document.body.appendChild(modal);

            // Auto-focus logic
            const inputs = [modal.querySelector('#p1'), modal.querySelector('#p2'), modal.querySelector('#p3'), modal.querySelector('#p4')];
            inputs.forEach((input, i) => {
                input.oninput = () => {
                    if (input.value && i < 3) inputs[i + 1].focus();
                };
                input.onkeydown = (e) => {
                    if (e.key === 'Backspace' && !input.value && i > 0) inputs[i - 1].focus();
                };
            });

            modal.querySelector('#cancelPin').onclick = () => modal.remove();
            modal.querySelector('#confirmPin').onclick = () => {
                const pin = inputs.map(i => i.value).join('');
                if (this.setAdultMode(pin)) {
                    modal.remove();
                } else {
                    modal.querySelector('#pinError').style.display = 'block';
                    inputs.forEach(i => i.value = '');
                    inputs[0].focus();
                }
            };
        }
    }
})();
