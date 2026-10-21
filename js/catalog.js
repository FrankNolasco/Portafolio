(() => {
  const form = document.querySelector('#catalog-filters');
  if (!form) return;
  const search = form.elements.consulta;
  const cards = [...document.querySelectorAll('[data-project]')];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const entries = cards.map(card => ({ card, text: normalize(`${card.querySelector('h2').textContent} ${card.querySelector('.project-description').textContent}`) }));
  let timer;
  function update() {
    let total = 0;
    const query = normalize(search.value.trim());
    entries.forEach(({card, text}) => {
      card.hidden = !(text.includes(query) && (form.elements.categoria.value === 'Todos' || card.dataset.category === form.elements.categoria.value));
      if (!card.hidden) total++;
    });
    const message = `${total} ${total === 1 ? 'proyecto' : 'proyectos'}`;
    document.querySelector('#project-count').textContent = message;
    document.querySelector('#catalog-empty').hidden = total !== 0;
    clearTimeout(timer);
    timer = setTimeout(() => { document.querySelector('#catalog-status').textContent = `${message} encontrados`; }, 250);
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('reset', () => {
    search.value = '';
    form.elements.categoria.value = 'Todos';
    update();
    search.focus();
  });
  form.hidden = false;
})();
