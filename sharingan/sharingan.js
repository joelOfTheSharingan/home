window.addEventListener("load", () => {
  const containers = document.querySelectorAll(
    ".eye-and-reflection-container"
  );

  let current = 0;

  containers[current].classList.add("active");

  setInterval(() => {
    containers[current].classList.remove("active");

    current = (current + 1) % containers.length;

    containers[current].classList.add("active");
  }, 3000);
});