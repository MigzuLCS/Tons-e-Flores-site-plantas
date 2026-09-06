/**
 * Tons & Flores • Catálogo Botânico & Gestão de Plantas
 * Copyright (c) 2026 Miguel Luiz (@MigzuLCS). Todos os direitos reservados.
 * 
 * LICENÇA DE USO ACADÊMICO / ACADEMIC VIEW-ONLY LICENSE
 * Este código-fonte é disponibilizado publicamente exclusivamente para fins de consulta
 * acadêmica e avaliação técnica de portfólio. É proibida qualquer cópia, alteração,
 * distribuição, uso comercial ou derivação deste código sem autorização expressa prévia.
 * O software é fornecido "COMO ESTÁ" (AS IS), sem garantias de qualquer tipo.
 * Consulte o arquivo LICENSE na raiz do projeto para obter os termos integrais.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
) as string;

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
) as string;

let client: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Credenciais não encontradas no .env. Certifique-se de usar o prefixo VITE_ (ex: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).'
  );
  // Cliente dummy/fallback para evitar throw de erro fatal durante o carregamento de módulos no browser
  client = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: { persistSession: false },
  });
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));