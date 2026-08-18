/* =========================================
   VIEWTOGGLE.JS - View Switcher
   ========================================= */

import { state } from "./carousel.js";

export function initViewToggle() {
  const gridRadio = document.getElementById("glass-gold");
  const carouselRadio = document.getElementById("glass-platinum");
  const gridContainer = document.getElementById("container");
  const carouselContainer = document.getElementById("all-projects-container");

  function updateVisibility() {
    if (carouselRadio && carouselRadio.checked) {
      if (carouselContainer) carouselContainer.style.display = "block";
      if (gridContainer) gridContainer.style.display = "none";
      state.focused = false;
    } else if (gridRadio && gridRadio.checked) {
      if (carouselContainer) carouselContainer.style.display = "none";
      if (gridContainer) gridContainer.style.display = "grid";
      state.focused = true;
    }
  }

  if (gridRadio) gridRadio.addEventListener("change", updateVisibility);
  if (carouselRadio) carouselRadio.addEventListener("change", updateVisibility);

  updateVisibility();
}