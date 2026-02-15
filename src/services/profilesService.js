import { supabase } from '../lib/supabaseClient.js'

export const profilesService = {
    async list() {
        return await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    },

    async updateRole(userId, role) {
        return await supabase.from('profiles').update({ role }).eq('id', userId)
    },

    async updatePlan(userId, plan) {
        return await supabase.from('profiles').update({ plan }).eq('id', userId)
    }
}
