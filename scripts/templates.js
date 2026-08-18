/* =========================================
   TEMPLATES.JS - HTML Generation Templates
   ========================================= */

export function getCardHTML(card) {
  return `
    <div class="img">
      ${
        card.svg === true
          ? `
            <svg
              class="project-icon livit-svg"
              viewBox="-2 -20 40 44"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M -1 1 L 20 23 L 24 19 L 7 1 L 24 -16 L 20 -20 Z"
                fill="#E53935"/>
              <path
                d="M 11 1 L 26 -14 L 30 -10 L 25 -5 L 37 7 L 33 11 L 21 -1 L 19 1 L 31 13 L 27 17 Z"
                fill="#E53935"/>
            </svg>
          `
          : `
            <img
              src="${card.img}"
              class="project-icon">
          `
      }
      <h2>${card.name}</h2>
      <p>${card.description}</p>
    </div>
  `;
}

export function getInfoCardHTML(card) {
  return `
    <div class="glass-inner">
      <p class="glass-label">INFO</p>
      <div class="glass-info-content">
        <h2>${card.name}</h2>
        <p>${card.description}</p>
      </div>
    </div>
  `;
}

export function getRightCardHTML(card) {
  const stackItems = card.stack
    .map(
      item => `
        <div class="glass-stack-item">
          <img src="${item.src}" alt="">
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");

  const linkItems = card.links
    .map(
      link => `
        <a
          class="glass-link-item"
          href="${link.url}"
          target="_blank"
          rel="noopener noreferrer">
          <img src="${link.src}" alt="">
          <span>${link.label}</span>
        </a>
      `
    )
    .join("");

  return `
    <div class="glass-inner">
      <p class="glass-label">STACK</p>
      <div class="glass-stack-list">
        ${stackItems}
      </div>
      <p class="glass-label glass-links-title">LINKS</p>
      <div class="glass-links-list">
        ${linkItems}
      </div>
    </div>
  `;
}