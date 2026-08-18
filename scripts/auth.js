/* =========================================
   AUTH.JS - Password & Unlock Verification
   ========================================= */

let enteredPassword = "";

const STATIC_SALT = "YourAppSecretSalt123!#";
const ENCRYPTED_PASSWORD =
  "1470726a552d8557bd5520ed70271e530b3a4f6ddd4d24f2fe41daa1094666ed";

export async function getDeterministicHash(text) {
  const encoder = new TextEncoder();
  const saltBuffer = encoder.encode(STATIC_SALT);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(text),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));

  return hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isPasswordCorrect() {
  const enteredHash = await getDeterministicHash(enteredPassword);
  return enteredHash === ENCRYPTED_PASSWORD;
}

export function appendPasswordChar(id) {
  enteredPassword += id;
}

export function handleUnlockSuccess() {
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = "none";
  });

  const glassContainer = document.querySelector(".glass-container");
  if (glassContainer) {
    glassContainer.style.display = "none";
  }

  const sharinganEffect = document.getElementById("sharingan-effect");
  if (sharinganEffect) {
    sharinganEffect.style.display = "flex";
  }

  document.querySelector("body").style.background = "black";

  const elements = document.querySelectorAll("body > :not(#sharingan-effect)");
  elements.forEach(el => {
    el.style.display = "none";
  });

  sessionStorage.setItem("chroma_pin_unlocked", "true");
  sessionStorage.setItem("chroma_unlock_time", Date.now().toString());

  if (typeof window.activateSharingan === "function") {
    window.activateSharingan();
  }
}