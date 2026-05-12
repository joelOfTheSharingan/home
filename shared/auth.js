// shared/auth.js

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
  "https://eycuakkufbolyyawlpno.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3Vha2t1ZmJvbHl5YXdscG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjkyODMsImV4cCI6MjA2OTgwNTI4M30.cfZgo625Au9Ss0dSJYMuEMWUvuzD-4mOBD1dvnfp_tI";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ─────────────────────────────
// REQUIRE LOGIN
// ─────────────────────────────

export async function requireAuth() {

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {

    window.location.href =
      "https://joelofthesharingan.github.io/login.html";

    return null;
  }

  return session;
}

// ─────────────────────────────
// GET CURRENT USER
// ─────────────────────────────

export async function getUser() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// ─────────────────────────────
// GOOGLE LOGIN
// ─────────────────────────────

export async function googleLogin() {

  const redirectUrl =

    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"

      ? "http://127.0.0.1:5501/"
      : "https://joelofthesharingan.github.io/home/";

  await supabase.auth.signInWithOAuth({

    provider: "google",

    options: {
      redirectTo: redirectUrl
    }
  });
}
// ─────────────────────────────
// LOGOUT
// ─────────────────────────────

export async function logout() {

  await supabase.auth.signOut();

  const loginUrl =

    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"

      ? "http://127.0.0.1:5501/login.html"
      : "https://joelofthesharingan.github.io/home/login.html";

  window.location.href =
    loginUrl;
}