import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

/**
 * REEMPLAZAR ESTOS VALORES CON TUS CREDENCIALES DE SUPABASE
 * Puedes encontrarlas en Settings > API en tu dashboard de Supabase.
 */
const supabaseUrl = 'https://ancbkpzobgctpagyczld.supabase.co'
const supabaseKey = 'sb_publishable_0tM22r98bvB0dkfNsbJbHg_gOE2-jT_'

export const supabase = createClient(supabaseUrl, supabaseKey)
