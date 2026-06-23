import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public (browser) Supabase client — uses the anon key.
// Returns null when env vars aren't configured yet, so the UI can show a
// friendly "not configured" message instead of crashing the build.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  if (!browserClient) {
    browserClient = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browserClient;
}

export const isSupabaseConfigured = Boolean(url && anon);
