-- 🌿 Tabela de Acervo Botânico Compartilhado (Tons & Flores)
-- Execute este script no SQL Editor do seu projeto Supabase para permitir
-- que todas as classificações do Gemini fiquem salvas para TODOS os usuários e dispositivos.

CREATE TABLE IF NOT EXISTS public.botanical_presets (
    id TEXT PRIMARY KEY,
    scientific TEXT,
    pt_name TEXT,
    family TEXT,
    origin TEXT,
    suggested_category TEXT,
    light TEXT,
    watering TEXT,
    pet_friendly BOOLEAN DEFAULT false,
    watering_tip TEXT,
    care_instructions TEXT,
    cycle TEXT,
    blooming_season TEXT,
    pests_diseases TEXT,
    toxicity TEXT,
    aliases TEXT[] DEFAULT '{}',
    image_url TEXT,
    source TEXT DEFAULT 'gemini',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.botanical_presets ENABLE ROW LEVEL SECURITY;

-- Permite leitura pública para todos os visitantes e administradores
CREATE POLICY "Permitir leitura pública do acervo botânico" 
ON public.botanical_presets 
FOR SELECT 
USING (true);

-- Permite inserção/atualização para que a IA salve novas fichas
CREATE POLICY "Permitir inserção e atualização do acervo botânico" 
ON public.botanical_presets 
FOR ALL 
USING (true)
WITH CHECK (true);
