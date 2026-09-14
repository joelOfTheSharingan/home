/* ==========================================================
   BACKGROUND SYSTEM - Permanent moon night(2)
   ========================================================== */

const PERMANENT_BACKGROUND = "images/night/night(2).png";

document.body.style.backgroundImage = `url("${PERMANENT_BACKGROUND}")`;

window.addEventListener("load", () => {
  const img = new Image();
  img.src = PERMANENT_BACKGROUND;

  if (!("caches" in window)) return;
  caches.open("background-cache-v1")
    .then(cache => cache.add(PERMANENT_BACKGROUND).catch(() => {}))
    .catch(() => {});
});
