(() => {
  const header = document.querySelector('.home .menu-principal');
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('nav');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.hash));
  const mobile = matchMedia('(max-width: 900px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame, destination = scrollY, running = false;
  const stop = () => { cancelAnimationFrame(frame); running = false; destination = scrollY; };
  const move = (top, duration) => {
    cancelAnimationFrame(frame);
    const start = scrollY, began = performance.now();
    destination = Math.max(0, Math.min(top, document.documentElement.scrollHeight - innerHeight));
    if (reduced.matches) { scrollTo(0, destination); running = false; return; }
    running = true;
    const tick = now => {
      const t = Math.max(0, Math.min(1, (now - began) / duration));
      scrollTo(0, start + (destination - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick); else running = false;
    };
    frame = requestAnimationFrame(tick);
  };
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.hidden = mobile.matches; };
  const layout = () => { toggle.hidden = !mobile.matches; close(); };
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.hidden = !open; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) stop();
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const target = document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault(); close();
    update();
    history.pushState(null, '', a.hash);
    target.focus({ preventScroll: true });
    move(scrollY + target.getBoundingClientRect().top - header.getBoundingClientRect().height - 16, 450);
  });
  // Smooth discrete mouse-wheel steps only; trackpad/inertial streams stay native.
  let lastWheel = -Infinity;
  addEventListener('wheel', e => {
    const now = performance.now(), interval = now - lastWheel; lastWheel = now;
    stop();
    if (reduced.matches || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !e.cancelable || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    for (let el = e.target; el instanceof Element && el !== document.body; el = el.parentElement) {
      if (el.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"])') || (/auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight)) return;
    }
    if (e.deltaMode === 0 && (Math.abs(e.deltaY) < 80 || interval < 70)) return;
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    const top = scrollY + delta;
    if (top <= 0 || top >= document.documentElement.scrollHeight - innerHeight) return;
    e.preventDefault(); move(top, 140);
  }, { passive: false });
  addEventListener('touchstart', stop, { passive: true });
  addEventListener('pointerdown', stop, { passive: true });
  reduced.addEventListener('change', stop);
  mobile.addEventListener('change', layout);
  const update = () => {
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--menu-height', `${height}px`);
    let active = sections[0];
    sections.forEach(s => { if (s.getBoundingClientRect().top <= height + 24) active = s; });
    links.forEach(a => { if (a.hash === `#${active.id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  };
  let scheduled = false;
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; update(); }); } }, { passive: true });
  new ResizeObserver(update).observe(header);
  layout(); update();
})();
