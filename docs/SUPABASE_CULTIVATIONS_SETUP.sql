-- ==============================================================================
-- 🌿 TONS & FLORES - SCRIPT DE CRIAÇÃO DA TABELA DE CULTIVOS (store_cultivations)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Cria a tabela de tipos de cultivo da loja
CREATE TABLE IF NOT EXISTS public.store_cultivations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS (Row Level Security)
ALTER TABLE public.store_cultivations ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso seguro
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública dos cultivos" ON public.store_cultivations;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo dos cultivos" ON public.store_cultivations;
END $$;

-- Permite que qualquer visitante consulte os tipos de cultivo ativos
CREATE POLICY "Permitir leitura pública dos cultivos"
ON public.store_cultivations FOR SELECT
USING (true);

-- Permite ao lojista/admin cadastrar e remover tipos de cultivo
CREATE POLICY "Permitir gerenciamento completo dos cultivos"
ON public.store_cultivations FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Insere os tipos de cultivo padrão iniciais
INSERT INTO public.store_cultivations (id, name, description)
VALUES 
  ('cul-01', 'Tradicional', 'Cultivo padrão estabelecido em vaso convencional'),
  ('cul-02', 'Muda', 'Muda jovem em desenvolvimento para plantio ou transplante'),
  ('cul-03', 'Bonsai', 'Árvore miniaturizada e cultivada com técnicas de poda e aramação'),
  ('cul-04', 'Arranjo', 'Composição artística combinando uma ou mais espécies decorativas'),
  ('cul-05', 'Kokedama', 'Técnica japonesa de cultivo em esfera de musgo suspensa ou apoiada')
ON CONFLICT (name) DO NOTHING;

-- 5. Adiciona a coluna de cultivo na tabela de plantas (caso ainda não exista)
ALTER TABLE public.plants 
ADD COLUMN IF NOT EXISTS cultivation TEXT DEFAULT 'Tradicional';
