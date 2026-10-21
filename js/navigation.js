(() => {
  const menu = document.querySelector('.menu-principal');
  if (!menu) return;
  const links = [...menu.querySelectorAll('li a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let pending = false;
  let animation;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stopAnimation = () => cancelAnimationFrame(animation);
  const moveTo = top => {
    stopAnimation();
    const start = window.scrollY;
    const destination = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
    if (reducedMotion.matches) {
      window.scrollTo({ top: destination, behavior: 'instant' });
      return;
    }
    const started = performance.now();
    const frame = now => {
      // El timestamp del frame puede preceder a performance.now() en este ciclo.
      const progress = Math.max(0, Math.min(1, (now - started) / 650));
      const eased = 1 - Math.pow(1 - progress, 3);
      // No encadenar animaciones nativas a cada fotograma.
      window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' });
      if (progress < 1) animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
  };
  const moveToSection = section => {
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    moveTo(window.scrollY + section.getBoundingClientRect().top - offset);
  };
  menu.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(link.hash.slice(1));
    if (!section) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    section.focus({ preventScroll: true });
    moveToSection(section);
  });
  // El teclado y el tacto deben poder interrumpir una transición.
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stopAnimation();
  });
  window.addEventListener('touchstart', stopAnimation, { passive: true });
  reducedMotion.addEventListener('change', stopAnimation);

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
        moveTo(window.scrollY + direction * remaining);
        wheelLocked = true;
        transitionUntil = performance.now() + (reducedMotion.matches ? 0 : 650);
        releaseAfterGesture();
      }
      return;
    }
    const next = sections[index + direction];
    if (!next) return;
    event.preventDefault();
    const reduced = reducedMotion.matches;
    moveToSection(next);
    wheelLocked = true;
    transitionUntil = performance.now() + (reduced ? 0 : 650);
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
