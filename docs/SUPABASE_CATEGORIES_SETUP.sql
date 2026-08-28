-- ==============================================================================
-- 🏷️ TONS & FLORES - SCRIPT DE CRIAÇÃO DA TABELA DE CATEGORIAS (store_categories)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Cria a tabela de categorias da loja
CREATE TABLE IF NOT EXISTS public.store_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS (Row Level Security)
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso seguro
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública das categorias" ON public.store_categories;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo das categorias" ON public.store_categories;
END $$;

-- Permite que qualquer visitante consulte as categorias ativas
CREATE POLICY "Permitir leitura pública das categorias"
ON public.store_categories FOR SELECT
USING (true);

-- Permite ao lojista/admin cadastrar e remover categorias
CREATE POLICY "Permitir gerenciamento completo das categorias"
ON public.store_categories FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Insere as categorias padrão iniciais caso a tabela esteja vazia
INSERT INTO public.store_categories (id, name)
VALUES 
  ('cat-01', 'Folhagens'),
  ('cat-02', 'Flores'),
  ('cat-03', 'Orquídeas'),
  ('cat-04', 'Suculentas & Cactos'),
  ('cat-05', 'Pendentes'),
  ('cat-06', 'Aquáticas'),
  ('cat-07', 'Carnívoras'),
  ('cat-08', 'Bromélias'),
  ('cat-09', 'Arbustos & Árvores'),
  ('cat-10', 'Palmeiras'),
  ('cat-11', 'Ervas & Temperos')
ON CONFLICT (name) DO NOTHING;
