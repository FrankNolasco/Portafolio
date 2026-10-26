(() => {
  const cover = document.querySelector('.portada');
  if (!cover) return;
  const actor = cover.querySelector('.portada-actor');
  const layout = () => {
    const width = cover.clientWidth, height = cover.clientHeight;
    const scale = Math.max(width / 1846, height / 852);
    const imageWidth = 1846 * scale, imageHeight = 852 * scale;
    const imageX = (width - imageWidth) * .53, imageY = (height - imageHeight) / 2;
    // Keep the peak in the crop and recompose the foreground independently so
    // the head and greeting remain visible when the panorama's sides are cropped.
    const portrait = width < height;
    const actorWidth = portrait ? Math.min(width * .7, 360) : Math.min(600 * scale, width * .36);
    actor.style.width = `${actorWidth}px`;
    actor.style.left = `${portrait ? width - actorWidth : Math.min(imageX + 1205 * scale, width - actorWidth)}px`;
    actor.style.top = `${portrait ? height * .45 : imageY + 245 * scale}px`;
    actor.style.right = 'auto';
    actor.style.bottom = 'auto';
  };
  new ResizeObserver(layout).observe(cover);
  layout();

  const button = document.querySelector('.portada-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true;
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
