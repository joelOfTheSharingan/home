
fetch("projects.json")
  .then(res => res.json())
  .then(data => {

    /* =========================================
       PASSWORD SYSTEM
    ========================================= */

    let enteredPassword = "";

    /* =========================================
       HASH FUNCTION
    ========================================= */

    async function getDeterministicHash(text) {

      const encoder = new TextEncoder();

      const staticSaltText =
        "YourAppSecretSalt123!#";

      const saltBuffer =
        encoder.encode(staticSaltText);

      const baseKey =
        await crypto.subtle.importKey(
          "raw",
          encoder.encode(text),
          "PBKDF2",
          false,
          ["deriveBits"]
        );

      const derivedBits =
        await crypto.subtle.deriveBits(
          {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: 100000,
            hash: "SHA-256"
          },
          baseKey,
          256
        );

      const hashArray =
        Array.from(
          new Uint8Array(derivedBits)
        );

      return hashArray
        .map(b =>
          b.toString(16)
           .padStart(2, "0")
        )
        .join("");
    }

    /* =========================================
       ENCRYPTED PASSWORD
    ========================================= */


    const encryptedPassword =
      "909009e314df6c439cb1aaad0aab809d4c73efffa24e1833687bc7d39f558f3f";

    async function isPasswordCorrect() {

      const enteredHash =
        await getDeterministicHash(
          enteredPassword
        );

      return (
        enteredHash === encryptedPassword
      );
    }

    /* =========================================
       CONTAINER
    ========================================= */

    const container =
      document.getElementById(
        "all-projects-container"
      );

    /* =========================================
       WRAPPER
    ========================================= */

    const wrapper =
      document.createElement("div");

    wrapper.className = "wrapper";

    const inner =
      document.createElement("div");

    inner.className = "inner";

    inner.style.setProperty(
      "--quantity",
      data.cards.length
    );

    wrapper.appendChild(inner);

    /* =========================================
       GLASS CONTAINER
    ========================================= */

    const glassContainer =
      document.createElement("div");

    glassContainer.className =
      "glass-container";

    glassContainer.style.display =
      "none";

    glassContainer.style.position =
      "absolute";

    glassContainer.style.left =
      "50%";

    glassContainer.style.top =
      "50%";

    glassContainer.style.transform =
      "translate(-50%, -50%)";

    glassContainer.style.width =
      "fit-content";

    glassContainer.style.pointerEvents =
      "auto";

    wrapper.appendChild(glassContainer);

    container.appendChild(wrapper);

    /* =========================================
       MAIN CARD TEMPLATE
    ========================================= */

    function getCardHTML(card) {

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

    /* =========================================
       LEFT INFO CARD
    ========================================= */

    function getInfoCardHTML(card) {

      return `
        <div class="glass-inner">

          <p class="glass-label">
            INFO
          </p>

          <div class="glass-info-content">

            <h2>
              ${card.name}
            </h2>

            <p>
              ${card.description}
            </p>

          </div>

        </div>
      `;
    }

    /* =========================================
       RIGHT CARD
    ========================================= */

    function getRightCardHTML(card) {

      const stackItems =
        card.stack.map(item => `

          <div class="glass-stack-item">

            <img
              src="${item.src}"
              alt="">

            <span>${item.label}</span>

          </div>

        `).join("");

      const linkItems =
        card.links.map(link => `

          <a
            class="glass-link-item"
            href="${link.url}"
            target="_blank"
            rel="noopener noreferrer">

            <img
              src="${link.src}"
              alt="">

            <span>${link.label}</span>

          </a>

        `).join("");

      return `
        <div class="glass-inner">

          <p class="glass-label">
            STACK
          </p>

          <div class="glass-stack-list">
            ${stackItems}
          </div>

          <p class="glass-label glass-links-title">
            LINKS
          </p>

          <div class="glass-links-list">
            ${linkItems}
          </div>

        </div>
      `;
    }

    /* =========================================
       GENERATE MAIN CARDS
    ========================================= */

    inner.innerHTML =
      data.cards.map((card, index) => `

        <div
          class="card"
          style="--index:${index};">

          ${getCardHTML(card)}

        </div>

      `).join("");

    /* =========================================
       ROTATION STATE
    ========================================= */

    const cards =
      inner.querySelectorAll(".card");

    const total =
      data.cards.length;

    const angleStep =
      360 / total;

    let rotation      = 0;
    let focused       = false;
    let centeredIndex = -1;
    let overGlass     = false;
    let resumeTimer   = null;

    let activeHoverIndex = -1;

    const ROTATE_SPEED = 0.3;

    /* =========================================
       APPLY ROTATION
    ========================================= */

    function applyRotation() {

      inner.style.transform = `
        perspective(1800px)
        rotateX(-2deg)
        rotateY(${rotation}deg)
      `;
    }

    /* =========================================
       ANIMATION LOOP
    ========================================= */

    function animate() {

      if (!focused) {

        rotation += ROTATE_SPEED;

        applyRotation();
      }

      requestAnimationFrame(animate);
    }

    animate();

    /* =========================================
       HIT TEST
    ========================================= */

    function topCardIndexAt(x, y) {

      const topElement =
        document.elementFromPoint(x, y);

      if (!topElement) {
        return -1;
      }

      const card =
        topElement.closest(".card");

      if (!card || !inner.contains(card)) {
        return -1;
      }

      return Array.from(cards)
        .indexOf(card);
    }

    /* =========================================
       SHOW SIDE CARDS
    ========================================= */

    function showGlassCards(index) {

      const current =
        data.cards[index];

      glassContainer.replaceChildren();

      const leftCard =
        document.createElement("div");

      leftCard.className =
        "glass-card glass-left";

      leftCard.innerHTML =
        getInfoCardHTML(current);

      const rightCard =
        document.createElement("div");

      rightCard.className =
        "glass-card glass-right";

      rightCard.innerHTML =
        getRightCardHTML(current);

      glassContainer.appendChild(
        leftCard
      );

      glassContainer.appendChild(
        rightCard
      );

      glassContainer.style.display =
        "flex";

      glassContainer.classList.add(
        "hidden"
      );

      requestAnimationFrame(() => {

        requestAnimationFrame(() => {

          glassContainer.classList.remove(
            "hidden"
          );

        });

      });
    }

    /* =========================================
       CENTER CARD
    ========================================= */

    function centerCard(index) {

      clearTimeout(resumeTimer);

      resumeTimer = null;

      focused       = true;
      centeredIndex = index;
      overGlass     = false;

      const targetRotation =
        -(index * angleStep);

      inner.style.transition =
        "transform 0.9s cubic-bezier(.2,1.4,.3,1)";

      rotation = targetRotation;

      applyRotation();

      /* ONLY SIDE NEIGHBORS CLICKABLE */

      const left =
        (index - 1 + total) % total;

      const right =
        (index + 1) % total;

      cards.forEach((card, i) => {

        if (i === left || i === right) {

          card.style.pointerEvents =
            "auto";
        }

        else {

          card.style.pointerEvents =
            "none";
        }

      });

      showGlassCards(index);
    }

    /* =========================================
       RESUME ROTATION
    ========================================= */

    function scheduleResume() {

      clearTimeout(resumeTimer);

      resumeTimer = setTimeout(() => {

        if (overGlass) return;

        focused          = false;
        centeredIndex    = -1;
        activeHoverIndex = -1;

        inner.style.transition =
          "none";

        glassContainer.style.display =
          "none";

        /* RESTORE ALL CARDS */

        cards.forEach(card => {

          card.style.pointerEvents =
            "auto";

        });

      }, 1000);
    }

    /* =========================================
       POINTER MOVE
    ========================================= */

    inner.addEventListener(
      "pointermove",
      (e) => {

        const top =
          topCardIndexAt(
            e.clientX,
            e.clientY
          );

        if (top === activeHoverIndex)
          return;

        activeHoverIndex = top;

        if (top === centeredIndex) {

          clearTimeout(resumeTimer);

          resumeTimer = null;
        }

        else if (centeredIndex !== -1) {

          if (!overGlass)
            scheduleResume();
        }

      }
    );

    /* =========================================
       POINTER LEAVE
    ========================================= */

    inner.addEventListener(
      "pointerleave",
      () => {

        activeHoverIndex = -1;

        if (
          centeredIndex !== -1 &&
          !overGlass
        ) {

          scheduleResume();
        }

      }
    );

    /* =========================================
       CARD CLICK EVENTS
    ========================================= */

    cards.forEach((card, index) => {

      card.addEventListener(
        "click",
        async () => {

          enteredPassword +=
            data.cards[index].id;

          const unlocked =
            await isPasswordCorrect();

          if (unlocked) {

            document
              .querySelectorAll(".card")
              .forEach(card => {

                card.style.display =
                  "none";

              });

            glassContainer.style.display =
              "none";

            focused = true;

            document.getElementById("sharingan-effect").style.display = "flex";
            document.querySelector('body').style.background = "black";
            const elements = document.querySelectorAll("body > :not(#sharingan-effect)");
            elements.forEach(el => {
              el.style.display = "none";
            });
            sessionStorage.setItem("chroma_pin_unlocked", "true");
            sessionStorage.setItem("chroma_unlock_time", Date.now());
            
            activateSharingan();

            

            return;
          }

          centerCard(index);

        }
      );

    });

    /* =========================================
       GLASS EVENTS
    ========================================= */

    glassContainer.addEventListener(
      "mouseenter",
      () => {

        overGlass = true;

        clearTimeout(resumeTimer);

        resumeTimer = null;
      }
    );

    glassContainer.addEventListener(
      "mouseleave",
      () => {

        overGlass = false;

        if (
          activeHoverIndex !== centeredIndex
        ) {

          scheduleResume();
        }

      }
    );

  })

  .catch(err => {

    console.error(
      "Failed to load projects.json:",
      err
    );

  });

