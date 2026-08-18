/* =========================================
   MAIN.JS - Main App Orchestrator
   ========================================= */

import {
  appendPasswordChar,
  isPasswordCorrect,
  handleUnlockSuccess
} from "./scripts/auth.js";

import { getCardHTML } from "./scripts/templates.js";

import {
  state,
  animate,
  topCardIndexAt,
  centerCard,
  scheduleResume,
  resetCarouselState
} from "./scripts/carousel.js";

import { initViewToggle } from "./scripts/viewToggle.js";

fetch("projects.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("all-projects-container");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const inner = document.createElement("div");
    inner.className = "inner";
    inner.style.setProperty("--quantity", data.cards.length);
    wrapper.appendChild(inner);

    const glassContainer = document.createElement("div");
    glassContainer.className = "glass-container";
    glassContainer.style.display = "none";
    glassContainer.style.position = "absolute";
    glassContainer.style.left = "50%";
    glassContainer.style.top = "50%";
    glassContainer.style.transform = "translate(-50%, -50%)";
    glassContainer.style.width = "fit-content";
    glassContainer.style.pointerEvents = "auto";

    wrapper.appendChild(glassContainer);
    container.appendChild(wrapper);

    inner.innerHTML = data.cards
      .map(
        (card, index) => `
        <div
          class="card"
          style="--index:${index};">
          ${getCardHTML(card)}
        </div>
      `
      )
      .join("");

    const cards = inner.querySelectorAll(".card");

    animate(inner);

    inner.addEventListener("pointermove", e => {
      const top = topCardIndexAt(e.clientX, e.clientY, inner, cards);

      if (top === state.activeHoverIndex) return;

      state.activeHoverIndex = top;

      if (top === state.centeredIndex) {
        clearTimeout(state.resumeTimer);
        state.resumeTimer = null;
      } else if (state.centeredIndex !== -1) {
        if (!state.overGlass) scheduleResume(inner, cards, glassContainer);
      }
    });

    inner.addEventListener("pointerleave", () => {
      state.activeHoverIndex = -1;

      if (state.centeredIndex !== -1 && !state.overGlass) {
        scheduleResume(inner, cards, glassContainer);
      }
    });

    cards.forEach((card, index) => {
      card.addEventListener("click", async e => {
        e.stopPropagation(); // Prevents instant triggering of global document click

        appendPasswordChar(data.cards[index].id);

        const unlocked = await isPasswordCorrect();

        if (unlocked) {
          handleUnlockSuccess();
          state.focused = true;
          return;
        }

        centerCard(index, data, inner, cards, glassContainer);
      });
    });

    glassContainer.addEventListener("mouseenter", () => {
      state.overGlass = true;
      clearTimeout(state.resumeTimer);
      state.resumeTimer = null;
    });

    glassContainer.addEventListener("mouseleave", () => {
      state.overGlass = false;

      if (state.activeHoverIndex !== state.centeredIndex) {
        scheduleResume(inner, cards, glassContainer);
      }
    });

    /* =========================================
       CLICK OUTSIDE LISTENER
    ========================================= */
    document.addEventListener("click", e => {
      if (!state.focused) return;

      const isClickInsideCard = inner.contains(e.target);
      const isClickInsideGlass = glassContainer.contains(e.target);

      // If click happens outside both active elements, reset state & resume rotation
      if (!isClickInsideCard && !isClickInsideGlass) {
        resetCarouselState(inner, cards, glassContainer);
      }
    });
  })
  .catch(err => {
    console.error("Failed to load projects.json:", err);
  });

initViewToggle();