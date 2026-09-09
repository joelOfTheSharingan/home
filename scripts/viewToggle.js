/* =========================================
   VIEWTOGGLE.JS
   Desktop / Mobile View
   ========================================= */

import { state } from "./carousel.js";

export function initViewToggle() {

    const desktopCarousel =
        document.getElementById("all-projects-container");

    const gridContainer =
        document.getElementById("container");

    function updateVisibility() {

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {

            // Mobile uses mobile carousel
            if (desktopCarousel) {
                desktopCarousel.style.display = "none";
            }

            if (gridContainer) {
                gridContainer.style.display = "none";
            }

            state.focused = false;

        } else {

            // Desktop uses existing carousel
            if (desktopCarousel) {
                desktopCarousel.style.display = "block";
            }

            if (gridContainer) {
                gridContainer.style.display = "none";
            }

            state.focused = false;
        }
    }

    updateVisibility();

    window.addEventListener("resize", updateVisibility);
}