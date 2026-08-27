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