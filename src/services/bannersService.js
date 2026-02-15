import { supabase } from '../lib/supabaseClient.js'

export const bannersService = {
    async list() {
        return await supabase.from('content_banners').select('*').order('order', { ascending: true })
    },

    async create(banner) {
        return await supabase.from('content_banners').insert([banner])
    },

    async update(id, updates) {
        return await supabase.from('content_banners').update(updates).eq('id', id)
    },

    async delete(id) {
        return await supabase.from('content_banners').delete().eq('id', id)
    },

    async toggleActive(id, currentState) {
        return await supabase.from('content_banners').update({ active: !currentState }).eq('id', id)
    }
}
