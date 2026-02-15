import { supabase } from '../lib/supabaseClient.js'

export const videosService = {
    async list() {
        return await supabase.from('content_videos').select('*').order('created_at', { ascending: false })
    },

    async create(video) {
        return await supabase.from('content_videos').insert([video])
    },

    async update(id, updates) {
        return await supabase.from('content_videos').update(updates).eq('id', id)
    },

    async delete(id) {
        return await supabase.from('content_videos').delete().eq('id', id)
    },

    async toggleActive(id, currentState) {
        return await supabase.from('content_videos').update({ active: !currentState }).eq('id', id)
    }
}
