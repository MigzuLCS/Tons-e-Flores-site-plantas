-- ==============================================================================
-- 🌿 TONS & FLORES - SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase (Dashboard -> SQL Editor -> New Query).
-- Ele cria:
--   1. A tabela de plantas do catálogo/estoque (plants)
--   2. A tabela de acervo botânico e cache compartilhado da IA (botanical_presets)
--   3. O bucket de armazenamento para fotos compactadas em WebP (plant-photos)
--   4. As políticas de segurança RLS (Row Level Security) e permissões de Storage
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA DE PLANTAS DA LOJA (Catálogo & Estoque)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    pot_size TEXT DEFAULT '',
    location TEXT DEFAULT '',
    status TEXT DEFAULT 'disponivel',
    light TEXT DEFAULT 'meia-sombra',
    watering TEXT DEFAULT 'moderada',
    pet_friendly BOOLEAN DEFAULT false,
    watering_tip TEXT DEFAULT '',
    care_instructions TEXT DEFAULT '',
    family TEXT,
    origin TEXT,
    cycle TEXT,
    blooming_season TEXT,
    pests_diseases TEXT,
    toxicity TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilita RLS na tabela de plantas
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a tabela de plantas
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública das plantas" ON public.plants;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo das plantas" ON public.plants;
END $$;

CREATE POLICY "Permitir leitura pública das plantas" 
ON public.plants 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir gerenciamento completo das plantas" 
ON public.plants 
FOR ALL 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE ACERVO BOTÂNICO & CACHE IA (botanical_presets)
-- ------------------------------------------------------------------------------
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

-- Habilita RLS na tabela de presets botânicos
ALTER TABLE public.botanical_presets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública do acervo botânico" ON public.botanical_presets;
    DROP POLICY IF EXISTS "Permitir inserção e atualização do acervo botânico" ON public.botanical_presets;
END $$;

CREATE POLICY "Permitir leitura pública do acervo botânico" 
ON public.botanical_presets 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção e atualização do acervo botânico" 
ON public.botanical_presets 
FOR ALL 
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. BUCKET DE ARMAZENAMENTO PARA FOTOS (plant-photos)
-- ------------------------------------------------------------------------------
-- Cria o bucket público 'plant-photos' se ainda não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'plant-photos',
    'plant-photos',
    true,
    5242880, -- Limite de 5MB por arquivo (as fotos WebP compactadas têm ~50KB)
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg'];

-- Políticas de acesso para o Bucket de Storage (storage.objects)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública de fotos de plantas" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir upload de fotos de plantas" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir atualização de fotos de plantas" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir exclusão de fotos de plantas" ON storage.objects;
END $$;

-- Permite que qualquer visitante ou aplicativo visualize as fotos
CREATE POLICY "Permitir leitura pública de fotos de plantas"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-photos');

-- Permite upload de novas fotos compactadas
CREATE POLICY "Permitir upload de fotos de plantas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plant-photos');

-- Permite atualizar/substituir fotos existentes
CREATE POLICY "Permitir atualização de fotos de plantas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'plant-photos');

-- Permite excluir fotos quando plantas forem deletadas
CREATE POLICY "Permitir exclusão de fotos de plantas"
ON storage.objects FOR DELETE
USING (bucket_id = 'plant-photos');
