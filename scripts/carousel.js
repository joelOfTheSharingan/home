/* =========================================
   CAROUSEL.JS - 3D Carousel Engine
   ========================================= */

import { getInfoCardHTML, getRightCardHTML } from "./templates.js";

const ROTATE_SPEED = 0.3;

export const state = {
  rotation: 0,
  focused: false,
  centeredIndex: -1,
  overGlass: false,
  resumeTimer: null,
  activeHoverIndex: -1
};

export function applyRotation(inner) {
  inner.style.transform = `
    perspective(1800px)
    rotateX(-2deg)
    rotateY(${state.rotation}deg)
  `;
}

export function animate(inner) {
  if (!state.focused) {
    state.rotation += ROTATE_SPEED;
    applyRotation(inner);
  }
  requestAnimationFrame(() => animate(inner));
}

export function topCardIndexAt(x, y, inner, cards) {
  const topElement = document.elementFromPoint(x, y);
  if (!topElement) return -1;

  const card = topElement.closest(".card");
  if (!card || !inner.contains(card)) return -1;

  return Array.from(cards).indexOf(card);
}

export function showGlassCards(index, data, glassContainer) {
  const current = data.cards[index];
  glassContainer.replaceChildren();

  const leftCard = document.createElement("div");
  leftCard.className = "glass-card glass-left";
  leftCard.innerHTML = getInfoCardHTML(current);

  const rightCard = document.createElement("div");
  rightCard.className = "glass-card glass-right";
  rightCard.innerHTML = getRightCardHTML(current);

  glassContainer.appendChild(leftCard);
  glassContainer.appendChild(rightCard);

  glassContainer.style.display = "flex";
  glassContainer.classList.add("hidden");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      glassContainer.classList.remove("hidden");
    });
  });
}

export function centerCard(index, data, inner, cards, glassContainer) {
  clearTimeout(state.resumeTimer);
  state.resumeTimer = null;

  state.focused = true;
  state.centeredIndex = index;
  state.overGlass = false;

  const total = data.cards.length;
  const angleStep = 360 / total;
  const targetRotation = -(index * angleStep);

  inner.style.transition = "transform 0.9s cubic-bezier(.2,1.4,.3,1)";
  state.rotation = targetRotation;

  applyRotation(inner);

  const left = (index - 1 + total) % total;
  const right = (index + 1) % total;

  cards.forEach((card, i) => {
    if (i === left || i === right) {
      card.style.pointerEvents = "auto";
    } else {
      card.style.pointerEvents = "none";
    }
  });

  showGlassCards(index, data, glassContainer);
}

/**
 * Resumes 3D rotation and hides side detail panels.
 */
export function resetCarouselState(inner, cards, glassContainer) {
  clearTimeout(state.resumeTimer);
  state.resumeTimer = null;

  state.focused = false;
  state.centeredIndex = -1;
  state.activeHoverIndex = -1;
  state.overGlass = false;

  inner.style.transition = "none";
  if (glassContainer) glassContainer.style.display = "none";

  cards.forEach(card => {
    card.style.pointerEvents = "auto";
  });
}

export function scheduleResume(inner, cards, glassContainer) {
  clearTimeout(state.resumeTimer);

  // If a card is currently focused/active, do NOT auto-resume on hover away
  if (state.focused) return;

  state.resumeTimer = setTimeout(() => {
    if (state.overGlass) return;
    resetCarouselState(inner, cards, glassContainer);
  }, 1000);
}