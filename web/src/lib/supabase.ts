import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para evolução pós-MVP (sync entre dispositivos / login).
 * Sem variáveis de ambiente, retorna null — o app usa localStorage.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
