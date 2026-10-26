(() => {
  const cover = document.querySelector('.portada');
  if (!cover) return;
  const actor = cover.querySelector('.portada-actor');
  const background = cover.querySelector('.portada-background');
  const layout = () => {
    const width = cover.clientWidth, height = cover.clientHeight;
    // Below 1100px, the embedded secondary lettering falls below roughly 12px.
    // Show the text-free source rectangle (650,420)-(1250,852), without
    // replacing or editing the supplied panorama. Larger screens keep it whole.
    const compact = width <= 1100;
    if (compact) {
      const scale = Math.min(width / 600, height / 432);
      Object.assign(background.style, {
        position: 'absolute', width: `${1846 * scale}px`, height: `${852 * scale}px`,
        left: `${(width - 600 * scale) / 2 - 650 * scale}px`,
        top: `${(height - 432 * scale) / 2 - 420 * scale}px`,
        clipPath: `inset(${420 * scale}px ${596 * scale}px 0 ${650 * scale}px)`
      });
      const actorWidth = Math.min(width * .6, height * .45, 420);
      actor.style.width = `${actorWidth}px`;
      actor.style.left = `${width - actorWidth}px`;
      actor.style.top = `${(height - actorWidth * 260 / 165) / 2}px`;
      actor.style.right = 'auto';
      actor.style.bottom = 'auto';
      return;
    }
    background.removeAttribute('style');
    const scale = Math.min(width / 1846, height / 852);
    const imageWidth = 1846 * scale, imageHeight = 852 * scale;
    const imageX = (width - imageWidth) / 2, imageY = (height - imageHeight) / 2;
    // Keep the existing foreground registered to the uncropped panorama.
    const actorWidth = 600 * scale;
    actor.style.width = `${actorWidth}px`;
    actor.style.left = `${imageX + 1205 * scale}px`;
    actor.style.top = `${imageY + 245 * scale}px`;
    actor.style.right = 'auto';
    actor.style.bottom = 'auto';
  };
  new ResizeObserver(layout).observe(cover);
  layout();

  const button = document.querySelector('.portada-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true;
  const update = () => {
    cover.classList.toggle('portada-running', !paused && visible && !document.hidden);
    button.hidden = false;
    button.dataset.paused = String(paused);
    button.setAttribute('aria-label', paused ? 'Reanudar animación' : 'Pausar animación');
  };
  fetch('./assets/portada-v4/llama.svg').then(response => {
    if (!response.ok) throw new Error('Llama no disponible');
    return response.text();
  }).then(text => {
    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) throw new Error('SVG no válido');
    const nodes = [...parsed.documentElement.children].map(node => document.importNode(node, true));
    // Scope the supplied animation without modifying the accepted resource.
    nodes.filter(node => node.tagName === 'style').forEach(style => {
      style.textContent = style.textContent.replace(/\.p4-/g, '.portada-actor .p4-');
    });
    actor.replaceChildren(...nodes);
    button.addEventListener('click', () => { paused = !paused; update(); });
    reduced.addEventListener('change', () => { paused = reduced.matches; update(); });
    document.addEventListener('visibilitychange', update);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(cover);
    update();
  }).catch(() => { /* The layered fallback remains static and needs no pause button. */ });
})();
