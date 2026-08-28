-- ==============================================================================
-- 📍 TONS & FLORES - SCRIPT DE CRIAÇÃO DA TABELA DE BANCADAS (store_locations)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Cria a tabela de bancadas e setores físicos da loja
CREATE TABLE IF NOT EXISTS public.store_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS (Row Level Security)
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso seguro
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura pública das bancadas" ON public.store_locations;
    DROP POLICY IF EXISTS "Permitir gerenciamento completo das bancadas" ON public.store_locations;
END $$;

-- Permite que qualquer cliente ou visitante consulte as bancadas ativas
CREATE POLICY "Permitir leitura pública das bancadas"
ON public.store_locations FOR SELECT
USING (true);

-- Permite ao lojista cadastrar, editar e remover bancadas
CREATE POLICY "Permitir gerenciamento completo das bancadas"
ON public.store_locations FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Insere as bancadas padrão iniciais caso a tabela esteja vazia
INSERT INTO public.store_locations (id, name, description)
VALUES 
  ('loc-01', 'Bancada Central • Estufa 01', 'Mesa principal de destaque na entrada'),
  ('loc-02', 'Bancada 02 • Sombra & Samambaias', 'Setor interno de meia sombra e folhagens'),
  ('loc-03', 'Bancada 03 • Sol Pleno & Cactos', 'Setor ensolarado para cactos e suculentas'),
  ('loc-04', 'Prateleira Suspensa • Pendentes', 'Estrutura vertical para vasos suspensos e jiboias'),
  ('loc-05', 'Entrada Principal • Destaques', 'Área de recepção e novidades da semana')
ON CONFLICT (name) DO NOTHING;
