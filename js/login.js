import { authService } from './src/services/authService.js'
import { toast } from './js/toast.js'

const form = document.getElementById('auth-form')
const btnMain = document.getElementById('btn-main')
const btnToggle = document.getElementById('btn-toggle')
const authTitle = document.getElementById('auth-title')
const userGroup = document.getElementById('user-group')

let isLogin = true

btnToggle.addEventListener('click', () => {
    isLogin = !isLogin
    authTitle.innerText = isLogin ? 'ADMIN PANEL' : 'REGISTRO'
    btnMain.innerText = isLogin ? 'INGRESAR' : 'CREAR CUENTA'
    btnToggle.innerText = isLogin ? '¿No tienes cuenta? Registrarme' : '¿Ya tienes cuenta? Iniciar sesión'
    userGroup.style.display = isLogin ? 'none' : 'block'
})

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const username = document.getElementById('username').value

    btnMain.disabled = true
    btnMain.innerText = isLogin ? 'INGRESANDO...' : 'REGISTRANDO...'

    try {
        if (isLogin) {
            const { data, error } = await authService.login(email, password)
            if (error) throw error

            // Verificar perfil
            const profile = await authService.getCurrentProfile()
            if (profile?.role === 'admin') {
                window.location.href = 'admin.html'
            } else {
                toast.show('Acceso restringido: Solo administradores', 'error')
                await authService.logout()
            }
        } else {
            const { error } = await authService.register(email, password, username)
            if (error) throw error
            toast.show('Cuenta creada. Ahora puedes iniciar sesión.')
            btnToggle.click()
        }
    } catch (err) {
        toast.show(err.message, 'error')
    } finally {
        btnMain.disabled = false
        btnMain.innerText = isLogin ? 'INGRESAR' : 'CREAR CUENTA'
    }
})
