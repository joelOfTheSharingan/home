/* ==========================================================
   BACKGROUND SYSTEM
   ========================================================== */

/* -------------------------
   1. ELEMENTS
------------------------- */

const body = document.body;

const toggle =
  document.querySelector(".theme-switch__checkbox");

/* -------------------------
   2. AUTO DAY / NIGHT
------------------------- */

const now = new Date();

let isNight =
  !(now.getHours() >= 6 && now.getHours() < 18);

toggle.checked = isNight;

/* -------------------------
   3. IMAGE ARRAYS
------------------------- */

const nightImages = [
  "images/night/night(1).png",
  "images/night/night(2).png",
  "images/night/night(3).png",
  "images/night/night(4).png",
  "images/night/night(5).png",
  "images/night/night(6).png",
  "images/night/night(7).png"
];

const dayImages = [
  "images/day/day(1).png",
  "images/day/day(2).png",
  "images/day/day(3).png",
  "images/day/day(4).png",
  "images/day/day(5).png"
];

/* -------------------------
   4. GET CURRENT IMAGE SET
------------------------- */

function getCurrentImages() {

  return isNight
    ? nightImages
    : dayImages;

}

/* -------------------------
   5. APPLY BACKGROUND
------------------------- */

function applyBackground(imagePath) {

  body.style.backgroundImage =
    `url("${imagePath}")`;

}

/* -------------------------
   6. RANDOM IMAGE
------------------------- */

function setRandomBackground() {

  const images =
    getCurrentImages();

  const randomIndex =
    Math.floor(
      Math.random() * images.length
    );

  const selectedImage =
    images[randomIndex];

  applyBackground(
    selectedImage
  );

  return selectedImage;

}

/* -------------------------
   7. PRELOAD ALL EXCEPT
      CURRENT IMAGE
------------------------- */

function preloadRemainingImages(
  currentImage
) {

  const allImages = [

    ...dayImages,

    ...nightImages

  ];

  allImages
    .filter(
      src => src !== currentImage
    )
    .forEach(src => {

      const img =
        new Image();

      img.src = src;

    });

}

/* -------------------------
   8. CACHE ALL IMAGES
------------------------- */

async function cacheImages() {

  if (!("caches" in window))
    return;

  try {

    const cache =
      await caches.open(
        "background-cache-v1"
      );

    const allImages = [

      ...dayImages,

      ...nightImages

    ];

    await Promise.all(

      allImages.map(
        async image => {

          try {

            await cache.add(
              image
            );

          } catch (err) {

            console.warn(
              "Cache failed:",
              image
            );

          }

        }
      )

    );

    console.log(
      "Background cache ready"
    );

  } catch (err) {

    console.error(
      "Cache error:",
      err
    );

  }

}

/* -------------------------
   9. INITIAL PAGE LOAD
------------------------- */

const currentImage =
  setRandomBackground();

/* -------------------------
   10. AFTER PAGE LOAD
------------------------- */

window.addEventListener(
  "load",
  () => {

    setTimeout(() => {

      preloadRemainingImages(
        currentImage
      );

      cacheImages();

    }, 200);

  }
);

/* -------------------------
   11. TOGGLE SWITCH
------------------------- */

toggle.addEventListener(
  "change",
  () => {

    isNight =
      toggle.checked;

    const currentImage =
      setRandomBackground();

    preloadRemainingImages(
      currentImage
    );

  }
);
