(() => {
  const cover = document.querySelector('.portada');
  if (!cover) return;
  const actor = cover.querySelector('.portada-actor');
  const layout = () => {
    const width = cover.clientWidth, height = cover.clientHeight;
    // Picture selects the complete compact compositions; only position the actor.
    const compact = width <= 1100;
    if (compact) {
      const imageRatio = width <= 600 ? 941 / 1672 : width <= 900 ? 1 : 1536 / 1024;
      const imageHeight = Math.min(height, width / imageRatio);
      const imageWidth = imageHeight * imageRatio;
      // Reserve the upper half for embedded lettering and the bottom for the signature.
      const actorWidth = Math.min(width * .6, imageHeight * .42 * 165 / 260, 420);
      actor.style.width = `${actorWidth}px`;
      actor.style.left = `${(width + imageWidth) / 2 - actorWidth}px`;
      actor.style.top = `${(height - imageHeight) / 2 + imageHeight * .5}px`;
      actor.style.right = 'auto';
      actor.style.bottom = 'auto';
      return;
    }
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
