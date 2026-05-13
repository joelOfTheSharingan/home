import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
  "https://eycuakkufbolyyawlpno.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3Vha2t1ZmJvbHl5YXdscG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjkyODMsImV4cCI6MjA2OTgwNTI4M30.cfZgo625Au9Ss0dSJYMuEMWUvuzD-4mOBD1dvnfp_tI";

export const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {

        persistSession: true,

        autoRefreshToken: true,

        detectSessionInUrl: true,

        storageKey:
          "joel-global-auth",
      },
    }
  );

/* ─────────────────────────────
   GOOGLE LOGIN
───────────────────────────── */
export async function googleLogin() {

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const redirectUrl = isLocal
    ? "http://localhost:3000/home/"
    : "https://joelofthesharingan.github.io/home/";

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: "select_account"
      }
    }
  });
}

/* ─────────────────────────────
   GET USER
───────────────────────────── */
export async function getUser() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

/* ─────────────────────────────
   LOGOUT
───────────────────────────── */
export async function logout() {

  await supabase.auth.signOut();
}
export async function requireAuth() {

  // wait for Supabase restore
  await new Promise(resolve =>
    setTimeout(resolve, 500)
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    window.location.href = isLocal
      ? "http://localhost:3000/home/login.html"
      : "https://joelofthesharingan.github.io/home/login.html";

    return null;
  }

  return session;
}