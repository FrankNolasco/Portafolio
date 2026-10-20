const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('js/theme.js', 'utf8');
for (const saved of [null, 'light', 'dark', 'invalid', 'blocked']) {
  const events = {};
  const button = { hidden: true, setAttribute(k, v) { this[k] = v; },
    addEventListener(k, fn) { events[k] = fn; } };
  const root = { dataset: {} };
  let stored = saved;
  vm.runInNewContext(source, {
    document: { documentElement: root,
      addEventListener(k, fn) { events[k] = fn; },
      querySelector() { return button; } },
    localStorage: {
      getItem() { if (saved === 'blocked') throw Error('blocked'); return saved; },
      setItem(k, v) { if (saved === 'blocked') throw Error('blocked'); stored = v; }
    }
  });
  const initial = saved === 'dark' ? 'dark' : 'light';
  assert.equal(root.dataset.theme, initial);
  events.DOMContentLoaded();
  assert.equal(button.hidden, false);
  assert.equal(button['aria-pressed'], String(initial === 'dark'));
  events.click();
  assert.notEqual(root.dataset.theme, initial);
  assert.equal(button['aria-pressed'], String(initial !== 'dark'));
  if (saved !== 'blocked') assert.equal(stored, root.dataset.theme);
  events.click();
  assert.equal(root.dataset.theme, initial);
}
console.log('OK: inicio, alternancia doble, aria-pressed, persistencia y almacenamiento bloqueado');
