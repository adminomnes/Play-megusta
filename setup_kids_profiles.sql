-- Script para habilitar Perfiles Infantiles en Play Me Gusta
-- Ejecuta esto en el editor de SQL de Supabase

-- 1. Agregar campo de tipo de perfil a la tabla de perfiles existente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'adult' CHECK (profile_type IN ('adult', 'kids'));

-- 2. Agregar campo para el PIN parental (opcional, por cuenta)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parental_pin text DEFAULT '1234';

-- 3. Crear una vista para facilitar la detección de contenido infantil (opcional)
-- Esto ayuda a que el backend o las consultas solo traigan contenido seguro.
CREATE OR REPLACE VIEW public.kids_safe_content AS
SELECT * FROM public.songs_kids WHERE active = true;

-- 4. Actualizar un perfil existente como prueba (opcional, reemplaza con un ID real si quieres)
-- UPDATE public.profiles SET profile_type = 'kids' WHERE id = 'ID_DEL_USUARIO';
