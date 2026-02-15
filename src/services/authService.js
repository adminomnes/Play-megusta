import { supabase } from '../lib/supabaseClient.js'

export const authService = {
    async login(email, password) {
        return await supabase.auth.signInWithPassword({ email, password })
    },

    async register(email, password, username) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        })

        if (!error && data.user) {
            // Intentar crear el perfil manualmente por si no existe trigger en DB
            await supabase.from('profiles').upsert({
                id: data.user.id,
                username,
                role: 'user',
                plan: 'free'
            })
        }
        return { data, error }
    },

    async logout() {
        return await supabase.auth.signOut()
    },

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    async getCurrentProfile() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        return data
    }
}
