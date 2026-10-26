(() => {
  const mural = document.querySelector('.mural');
  if (!mural) return;
  const ns = 'http://www.w3.org/2000/svg';
  const art = mural.querySelector('.mural-art');
  const mobile = matchMedia('(max-aspect-ratio: 1/1)');
  const layout = () => {
    art.setAttribute('viewBox', mobile.matches ? '0 0 240 320' : '0 0 480 320');
    const sceneTransform = mobile.matches ? 'translate(-76 0) scale(.91 1)' : '';
    mural.querySelector('.mural-scene').setAttribute('transform', sceneTransform);
    mural.querySelector('.mural-depth').setAttribute('transform', sceneTransform);
    mural.querySelector('.mural-animal').setAttribute('transform', mobile.matches ? 'translate(116 118) scale(.88)' : 'translate(340 96)');
    mural.querySelector('.mural-lettering').setAttribute('transform', mobile.matches ? 'translate(87 50) scale(4.75 4)' : 'translate(125 50) scale(6 4)');
  };
  mobile.addEventListener('change', layout);
  layout();

  // Original 5×7 bitmap lettering: no remote font or softened glyph edges.
  const letters = {
    B:['11110','10001','10001','11110','10001','10001','11110'],
    I:['11111','00100','00100','00100','00100','00100','11111'],
    E:['11111','10000','10000','11110','10000','10000','11111'],
    N:['10001','11001','11001','10101','10011','10011','10001'],
    V:['10001','10001','10001','10001','10001','01010','00100'],
    D:['11110','10001','10001','10001','10001','10001','11110'],
    O:['01110','10001','10001','10001','10001','10001','01110']
  };
  const lettering = document.createElementNS(ns, 'g');
  lettering.setAttribute('shape-rendering', 'crispEdges');
  [...'BIENVENIDO'].forEach((letter, index) => letters[letter].forEach((row,y) => [...row].forEach((pixel,x) => {
    if (pixel !== '1') return;
    const rect = document.createElementNS(ns, 'rect');
    Object.entries({x:index*5.5+x,y,width:1,height:1}).forEach(([key,value]) => rect.setAttribute(key,value));
    lettering.append(rect);
  })));
  lettering.setAttribute('stroke', 'none');
  mural.querySelector('.mural-lettering').replaceChildren(lettering);

  // User-space mask and lettering share the landscape's exact coordinate system.
  // Import the original contour, rather than stretching an image to the glyph bounds.
  fetch('./assets/machu-picchu/welcome-mask.svg').then(response => {
    if (!response.ok) throw new Error('Máscara no disponible');
    return response.text();
  }).then(text => {
    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
    const defs = parsed.querySelector('defs');
    if (parsed.querySelector('parsererror') || !defs) throw new Error('Máscara no válida');
    const imported = document.importNode(defs, true);
    imported.querySelector('mask').id = 'mural-text-outside-mountain';
    art.prepend(imported);
    mural.querySelector('.mural-welcome').setAttribute('mask', 'url(#mural-text-outside-mountain)');
    mural.classList.add('mural-mask-ready');
  }).catch(() => { /* Keep the accessible heading if its decorative mask cannot load. */ });

  const button = mural.querySelector('.mural-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true;
  const update = () => {
    mural.classList.toggle('mural-running', !paused && visible && !reduced.matches && !document.hidden);
    button.hidden = reduced.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Reanudar animación' : 'Pausar animación';
  };
  fetch('./assets/machu-picchu/llama-cubic.svg').then(response => {
    if (!response.ok) throw new Error('Recurso no disponible');
    return response.text();
  }).then(text => {
    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) throw new Error('SVG no válido');
    const svg = mural.querySelector('.mural-llama');
    svg.replaceChildren(...[...parsed.documentElement.children].map(node => document.importNode(node,true)));
    button.addEventListener('click', () => { paused = !paused; update(); });
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(mural);
    update();
  }).catch(() => { /* Preserve the complete, static image if enhancement fails. */ });
})();
