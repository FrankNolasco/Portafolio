(() => {
  const menu = document.querySelector('.menu-principal');
  if (!menu) return;
  const links = [...menu.querySelectorAll('li a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let pending = false;

  // Un gesto (incluida la inercia del trackpad) solo cambia una sección.
  let wheelLocked = false;
  let releaseWheel;
  let transitionUntil = 0;
  const releaseAfterGesture = () => {
    clearTimeout(releaseWheel);
    releaseWheel = setTimeout(() => {
      wheelLocked = false;
    }, Math.max(200, transitionUntil - performance.now()));
  };
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || !event.cancelable ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    // No apropiarse del scroll de controles o contenedores independientes.
    for (let node = event.target; node instanceof Element && node !== document.body; node = node.parentElement) {
      if (node.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])') ||
          (/auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)) return;
    }
    if (wheelLocked) {
      event.preventDefault();
      releaseAfterGesture();
      return;
    }
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    let index = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= offset + 2) index = i;
    });
    const rect = sections[index].getBoundingClientRect();
    const direction = Math.sign(event.deltaY);
    const remaining = direction > 0 ? rect.bottom - window.innerHeight : offset - rect.top;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (remaining > 2) {
      // Llegar al final del contenido antes de permitir abandonar la sección.
      if (Math.abs(delta) > remaining) {
        event.preventDefault();
        window.scrollBy({ top: direction * remaining, behavior: 'instant' });
        wheelLocked = true;
        transitionUntil = 0;
        releaseAfterGesture();
      }
      return;
    }
    const next = sections[index + direction];
    if (!next) return;
    event.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    next.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    wheelLocked = true;
    transitionUntil = performance.now() + (reduced ? 0 : 1000);
    releaseAfterGesture();
  }, { passive: false });

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
