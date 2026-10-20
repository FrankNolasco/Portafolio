(() => {
  const root = document.documentElement;
  // El almacenamiento puede estar bloqueado; el selector sigue funcionando.
  let theme = "light";
  try {
    if (localStorage.getItem("portfolio-theme") === "dark") theme = "dark";
  } catch (_) {}
  root.dataset.theme = theme;

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme-toggle");
    if (!button) return;
    const update = () => {
      button.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    };
    update();
    button.hidden = false;
    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      update();
      try {
        localStorage.setItem("portfolio-theme", root.dataset.theme);
      } catch (_) {}
    });
  });
})();
