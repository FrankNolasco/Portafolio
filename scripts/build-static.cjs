const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
// Explicit publication boundary: never copy the checkout or legacy assets.
const files = [
  'index.html',
  'proyectos.html',
  'css/site.css',
  'css/machu-picchu.css',
  'js/theme.js',
  'js/navigation.js',
  'js/mural.js',
  'assets/portada-v4/background.png',
  'assets/portada-v4/llama.svg',
  'assets/portada-v4/body.png',
  'assets/portada-v4/head.png',
  'assets/portada-v4/front-leg.png',
  'js/catalog.js',
  'js/project-dialog.js',
  'assets/demos/orbita.svg',
  'assets/demos/lumbre.svg',
  'assets/demos/travesia.svg',
  'assets/demos/pulso.svg',
  'assets/demos/estante.svg',
  'assets/demos/mesa.svg',
];

// Validate every input before replacing the generated output.
for (const file of files) {
  if (!fs.lstatSync(path.join(root, file)).isFile()) {
    throw new Error(`Expected a regular publication file: ${file}`);
  }
}
const output = path.join(root, 'dist');
fs.rmSync(output, { recursive: true, force: true });
for (const file of files) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}
console.log(`Static output: dist/ (${files.length} files)`);
console.log(files.join('\n'));
