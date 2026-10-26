(() => {
  const mural = document.querySelector('.mural');
  if (!mural) return;
  const ns = 'http://www.w3.org/2000/svg';
  const art = mural.querySelector('.mural-art');
  const mobile = matchMedia('(max-aspect-ratio: 1/1)');
  const layout = () => {
    art.setAttribute('viewBox', mobile.matches ? '0 0 240 320' : '0 0 480 320');
    mural.querySelector('.mural-scene').setAttribute('transform', mobile.matches ? 'translate(-76 0) scale(.91 1)' : '');
    mural.querySelector('.mural-animal').setAttribute('transform', mobile.matches ? 'translate(116 118) scale(.88)' : 'translate(340 96)');
    mural.querySelector('.mural-welcome').setAttribute('transform', mobile.matches ? 'translate(30 22)' : 'translate(114 22)');
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
  lettering.setAttribute('transform', 'translate(0 2) scale(1.65)');
  lettering.setAttribute('shape-rendering', 'crispEdges');
  [...'BIENVENIDO'].forEach((letter, index) => letters[letter].forEach((row,y) => [...row].forEach((pixel,x) => {
    if (pixel !== '1') return;
    const rect = document.createElementNS(ns, 'rect');
    Object.entries({x:index*6+x,y,width:1,height:1}).forEach(([key,value]) => rect.setAttribute(key,value));
    lettering.append(rect);
  })));
  lettering.setAttribute('stroke', 'none');
  const shadow = lettering.cloneNode(true);
  shadow.setAttribute('transform', 'translate(.7 2.7) scale(1.65)');
  shadow.setAttribute('fill', '#293d40');
  mural.querySelector('.mural-welcome').replaceChildren(shadow, lettering);

  const button = mural.querySelector('.mural-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true;
  const update = () => {
    mural.classList.toggle('mural-running', !paused && visible && !reduced.matches && !document.hidden);
    button.hidden = reduced.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Reanudar animación' : 'Pausar animación';
  };
  fetch('./assets/machu-picchu/llama.svg').then(response => {
    if (!response.ok) throw new Error('Recurso no disponible');
    return response.text();
  }).then(text => {
    const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) throw new Error('SVG no válido');
    const svg = mural.querySelector('.mural-llama');
    svg.replaceChildren(...[...parsed.documentElement.children].map(node => document.importNode(node,true)));
    const pivots = {'leg-rear-far':[93.5,146], 'leg-front-far':[57.5,150], 'leg-rear-near':[101.5,150], 'leg-front-near':[70,154]};
    Object.entries(pivots).forEach(([id,[x,y]]) => {
      const leg = svg.querySelector(`#${id}`);
      leg.classList.add('mural-leg');
      if (id === 'leg-front-far' || id === 'leg-rear-near') leg.classList.add('mural-leg-opposite');
      leg.style.transformOrigin = `${x}px ${y}px`;
    });
    button.addEventListener('click', () => { paused = !paused; update(); });
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(mural);
    update();
  }).catch(() => { /* Preserve the complete, static image if enhancement fails. */ });
})();
