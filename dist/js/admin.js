import { authGuard } from './auth-guard.js'
import { authService } from '../src/services/authService.js'
import { profilesService } from '../src/services/profilesService.js'
import { videosService } from '../src/services/videosService.js'
import { bannersService } from '../src/services/bannersService.js'
import { toast } from './toast.js'

class AdminApp {
    constructor() {
        this.init()
    }

    async init() {
        const profile = await authGuard.checkAdmin()
        if (!profile) return

        this.user = profile
        document.getElementById('user-badge').innerText = `Hola, ${profile.username}`
        lucide.createIcons()

        document.getElementById('logout-btn').onclick = async () => {
            await authService.logout()
            window.location.href = 'index.html'
        }

        window.appInstance = this
        this.loadSection('dashboard')
        this.setupModal()
    }

    setupModal() {
        this.modal = document.getElementById('modal-container')
        this.modalForm = document.getElementById('modal-form')
        this.modalFields = document.getElementById('modal-fields')
        this.modalTitle = document.getElementById('modal-title')

        this.modalForm.onsubmit = async (e) => {
            e.preventDefault()
            const formData = new FormData(this.modalForm)
            const data = Object.fromEntries(formData.entries())
            await this.handleModalSubmit(data)
        }
    }

    async loadSection(name) {
        const area = document.getElementById('content-area')
        const title = document.getElementById('section-title')
        title.innerText = name.charAt(0).toUpperCase() + name.slice(1)
        area.innerHTML = '<div class="loading-state">Cargando...</div>'

        try {
            switch (name) {
                case 'dashboard': await this.renderDashboard(area); break
                case 'usuarios': await this.renderUsers(area); break
                case 'videos': await this.renderVideos(area); break
                case 'banners': await this.renderBanners(area); break
            }
        } catch (err) {
            area.innerHTML = `<div style="color:red">Error: ${err.message}</div>`
        }
    }

    async renderDashboard(container) {
        const [u, v, b] = await Promise.all([profilesService.list(), videosService.list(), bannersService.list()])
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>${u.data?.length || 0}</h3><p>Usuarios</p></div>
                <div class="stat-card"><h3>${v.data?.length || 0}</h3><p>Videos</p></div>
                <div class="stat-card"><h3>${b.data?.length || 0}</h3><p>Banners</p></div>
            </div>`
    }

    async renderUsers(container) {
        const { data } = await profilesService.list()
        container.innerHTML = `<div class="data-table-container"><table>
            <thead><tr><th>Username</th><th>Rol</th><th>Plan</th><th>Estado</th></tr></thead>
            <tbody>${data.map(u => `<tr>
                <td>${u.username}</td>
                <td><select onchange="window.appInstance.updateRole('${u.id}', this.value)">
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select></td>
                <td><select onchange="window.appInstance.updatePlan('${u.id}', this.value)">
                    <option value="free" ${u.plan === 'free' ? 'selected' : ''}>Free</option>
                    <option value="premium" ${u.plan === 'premium' ? 'selected' : ''}>Premium</option>
                </select></td>
                <td><button class="badge ${u.blocked ? 'blocked' : 'premium'}" onclick="window.appInstance.toggleBlock('${u.id}', ${u.blocked})">
                    ${u.blocked ? 'Bloqueado' : 'Activo'}
                </button></td>
            </tr>`).join('')}</tbody></table></div>`
    }

    async renderVideos(container) {
        const { data } = await videosService.list()
        container.innerHTML = `
            <button class="btn-primary" onclick="window.appInstance.openVideoModal()" style="margin-bottom:20px">+ Nuevo Video</button>
            <div class="data-table-container"><table>
                <thead><tr><th>Título</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>${data.map(v => `<tr>
                    <td>${v.title}</td>
                    <td><span class="badge ${v.active ? 'premium' : 'free'}">${v.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <button onclick="window.appInstance.toggleVideo('${v.id}', ${v.active})">Alternar</button>
                        <button onclick="window.appInstance.deleteVideo('${v.id}')" style="color:red">Eliminar</button>
                    </td>
                </tr>`).join('')}</tbody></table></div>`
    }

    async renderBanners(container) {
        const { data } = await bannersService.list()
        container.innerHTML = `
            <button class="btn-primary" onclick="window.appInstance.openBannerModal()" style="margin-bottom:20px">+ Nuevo Banner</button>
            <div class="data-table-container"><table>
                <thead><tr><th>Título</th><th>Orden</th><th>Acciones</th></tr></thead>
                <tbody>${data.map(b => `<tr>
                    <td>${b.title}</td>
                    <td>${b.order}</td>
                    <td><button onclick="window.appInstance.deleteBanner('${b.id}')" style="color:red">Eliminar</button></td>
                </tr>`).join('')}</tbody></table></div>`
    }

    async updateRole(id, role) { await profilesService.updateRole(id, role); toast.show('Rol actualizado'); }
    async updatePlan(id, plan) { await profilesService.updatePlan(id, plan); toast.show('Plan actualizado'); }
    async toggleBlock(id, cur) { await profilesService.updateStatus(id, !cur); this.loadSection('usuarios'); toast.show('Estado de cuenta actualizado'); }
    async toggleVideo(id, cur) { await videosService.toggleActive(id, cur); this.loadSection('videos'); toast.show('Estado video actualizado'); }
    async deleteVideo(id) { if (confirm('¿Eliminar video?')) { await videosService.delete(id); this.loadSection('videos'); toast.show('Video eliminado'); } }
    async deleteBanner(id) { if (confirm('¿Eliminar banner?')) { await bannersService.delete(id); this.loadSection('banners'); toast.show('Banner eliminado'); } }

    openVideoModal() {
        this.currentAction = 'create_video'
        this.modalTitle.innerText = 'Nuevo Video'
        this.modalFields.innerHTML = `
            <label>Título</label><input name="title" required placeholder="Ej: Película 1">
            <label>URL Video</label><input name="url" required placeholder="https://...">
            <label>URL Imagen</label><input name="thumbnail" placeholder="https://...">
            <label>Categoría</label><select name="category">
                <option value="peliculas">Películas</option>
                <option value="radio">Radio TV</option>
                <option value="kids">Kids</option>
            </select>
        `
        this.modal.style.display = 'flex'
    }

    openBannerModal() {
        this.currentAction = 'create_banner'
        this.modalTitle.innerText = 'Nuevo Banner'
        this.modalFields.innerHTML = `
            <label>Título</label><input name="title" required>
            <label>URL Imagen</label><input name="image_url" required>
            <label>Link (Opcional)</label><input name="link_url">
            <label>Orden</label><input type="number" name="order" value="0">
        `
        this.modal.style.display = 'flex'
    }

    closeModal() { this.modal.style.display = 'none' }

    async handleModalSubmit(data) {
        try {
            if (this.currentAction === 'create_video') {
                await videosService.create({ ...data, active: true })
                this.loadSection('videos')
            } else if (this.currentAction === 'create_banner') {
                await bannersService.create({ ...data, active: true })
                this.loadSection('banners')
            }
            toast.show('Guardado correctamente')
            this.closeModal()
        } catch (err) { toast.show(err.message, 'error') }
    }
}

new AdminApp()
