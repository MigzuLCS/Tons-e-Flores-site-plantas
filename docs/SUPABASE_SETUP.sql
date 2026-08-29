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
    cultivation TEXT DEFAULT 'Tradicional',
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

-- ------------------------------------------------------------------------------
-- 4. TABELA DE BANCADAS E SETORES DA LOJA (store_locations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública das bancadas" ON public.store_locations;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo das bancadas" ON public.store_locations;
END $$;

CREATE POLICY "Permitir leitura pública das bancadas" 
ON public.store_locations FOR SELECT 
USING (true);

CREATE POLICY "Permitir gerenciamento completo das bancadas" 
ON public.store_locations FOR ALL 
USING (true)
WITH CHECK (true);

-- Bancadas iniciais padrão
INSERT INTO public.store_locations (id, name, description)
VALUES 
  ('loc-01', 'Bancada Central • Estufa 01', 'Mesa principal de destaque na entrada'),
  ('loc-02', 'Bancada 02 • Sombra & Samambaias', 'Setor interno de meia sombra e folhagens'),
  ('loc-03', 'Bancada 03 • Sol Pleno & Cactos', 'Setor ensolarado para cactos e suculentas'),
  ('loc-04', 'Prateleira Suspensa • Pendentes', 'Estrutura vertical para vasos suspensos e jiboias'),
  ('loc-05', 'Entrada Principal • Destaques', 'Área de recepção e novidades da semana')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. TABELA DE TIPOS DE CULTIVO (store_cultivations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_cultivations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.store_cultivations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública dos cultivos" ON public.store_cultivations;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo dos cultivos" ON public.store_cultivations;
END $$;

CREATE POLICY "Permitir leitura pública dos cultivos" 
ON public.store_cultivations FOR SELECT 
USING (true);

CREATE POLICY "Permitir gerenciamento completo dos cultivos" 
ON public.store_cultivations FOR ALL 
USING (true)
WITH CHECK (true);

INSERT INTO public.store_cultivations (id, name, description)
VALUES 
  ('cul-01', 'Tradicional', 'Cultivo padrão estabelecido em vaso convencional'),
  ('cul-02', 'Muda', 'Muda jovem em desenvolvimento para plantio ou transplante'),
  ('cul-03', 'Bonsai', 'Árvore miniaturizada e cultivada com técnicas de poda e aramação'),
  ('cul-04', 'Arranjo', 'Composição artística combinando uma ou mais espécies decorativas'),
  ('cul-05', 'Kokedama', 'Técnica japonesa de cultivo em esfera de musgo suspensa ou apoiada')
ON CONFLICT (name) DO NOTHING;


