import { createClient } from "@supabase/supabase-js";

/** Avoid double slashes in REST paths (e.g. URL ending with `/` breaks routing). */
function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);

// Dashboard may label this as "anon public" (JWT) or a publishable key — both are valid for the client.
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "[CryptoChat] Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
