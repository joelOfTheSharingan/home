import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
  "https://eycuakkufbolyyawlpno.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3Vha2t1ZmJvbHl5YXdscG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjkyODMsImV4cCI6MjA2OTgwNTI4M30.cfZgo625Au9Ss0dSJYMuEMWUvuzD-4mOBD1dvnfp_tI";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// ─────────────────────────────
// GOOGLE LOGIN (FIXED)
// ─────────────────────────────
export async function googleLogin() {
  const redirectUrl = window.location.origin + "/home/";

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      flowType: "pkce",
      queryParams: {
        prompt: "select_account"
      }
    }
  });
}