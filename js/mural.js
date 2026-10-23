(() => {
  const mural = document.querySelector('.mural');
  if (!mural) return;
  const landscape = mural.querySelector('.mural-landscape');
  const button = mural.querySelector('.mural-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  new ResizeObserver(entries => {
    const size = entries[0].borderBoxSize[0].blockSize;
    mural.style.setProperty('--mural-controls-height', `${size}px`);
  }).observe(mural.querySelector('.mural-base'));
  let paused = false, visible = false;
  const update = () => {
    mural.classList.toggle('mural-running', visible && !paused && !reduced.matches && !document.hidden);
    button.hidden = reduced.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Reanudar animación' : 'Pausar animación';
  };
  // The local picture remains complete if fetching or enhancement is unavailable.
  Promise.all(['desktop', 'tablet', 'mobile'].map(async variant => {
    const response = await fetch(`./assets/mural/scene-${variant}.svg`);
    if (!response.ok) throw new Error('Mural no disponible');
    const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    if (parsed.querySelector('parsererror')) throw new Error('SVG no válido');
    const svg = document.importNode(parsed.documentElement, true);
    svg.querySelectorAll('style').forEach(style => style.remove());
    const classes = {desktop: 'mural-desktop', tablet: 'mural-tablet', mobile: 'mural-mobile'};
    svg.classList.add('mural-art', classes[variant]);
    svg.removeAttribute('role');
    svg.removeAttribute('aria-label');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.querySelectorAll('[id]').forEach(group => {
      const name = group.id;
      group.id = `mural-${variant}-${name}`;
      if (name === 'clouds' || name.startsWith('llama-')) {
        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        inner.setAttribute('class', name === 'clouds' ? 'mural-clouds' : 'mural-llama');
        while (group.firstChild) inner.append(group.firstChild);
        group.append(inner);
      }
    });
    return svg;
  })).then(scenes => {
    landscape.replaceChildren(...scenes);
    button.addEventListener('click', () => { paused = !paused; update(); });
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    let observer;
    new ResizeObserver(entries => {
      observer?.disconnect();
      observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        update();
      }, {rootMargin: `-${entries[0].borderBoxSize[0].blockSize}px 0px 0px 0px`});
      observer.observe(landscape);
    }).observe(document.querySelector('.menu-principal'));
    update();
  }).catch(() => { /* Keep the static local illustration and no inactive control. */ });
})();
