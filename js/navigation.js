(() => {
  const menu = document.querySelector('.menu-principal');
  if (!menu) return;
  const links = [...menu.querySelectorAll('li a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let pending = false;

  // La barra puede ocupar varias filas por ancho, zoom o tamaño de texto.
  const measureMenu = () => {
    document.documentElement.style.setProperty('--menu-height', `${menu.getBoundingClientRect().height}px`);
    schedule();
  };

  const update = () => {
    pending = false;
    const boundary = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 1;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= boundary) current = section;
    }
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    for (const link of links) {
      if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  const schedule = () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measureMenu);
  window.addEventListener('load', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(measureMenu).observe(menu);
  measureMenu();
  update();
})();
