-- Script para crear la tabla de canciones infantiles Globinobys
-- Ejecuta esto en el editor de SQL de Supabase

CREATE TABLE IF NOT EXISTS public.songs_kids (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    artist text DEFAULT 'Globinobys',
    cover_url text DEFAULT 'https://i.ibb.co/sdNCjFn8/Chat-GPT-Image-7-feb-2026-11-56-45-p-m.png',
    audio_url text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS (Seguridad a nivel de fila)
ALTER TABLE public.songs_kids ENABLE ROW LEVEL SECURITY;

-- Crear política para que cualquiera pueda leer las canciones
DROP POLICY IF EXISTS "Permitir lectura pública de canciones infantiles" ON public.songs_kids;
CREATE POLICY "Permitir lectura pública de canciones infantiles" 
ON public.songs_kids FOR SELECT 
TO anon
USING (true);

-- Insertar las canciones iniciales (solo si no existen)
INSERT INTO public.songs_kids (title, audio_url)
SELECT 'Amistad', 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/Amistad.mp3'
WHERE NOT EXISTS (SELECT 1 FROM public.songs_kids WHERE title = 'Amistad');

INSERT INTO public.songs_kids (title, audio_url)
SELECT 'El Verano', 'https://ancbkpzobgctpagyczld.supabase.co/storage/v1/object/public/Music/El%20Verano.mp3'
WHERE NOT EXISTS (SELECT 1 FROM public.songs_kids WHERE title = 'El Verano');
