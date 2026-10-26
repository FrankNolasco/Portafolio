const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'assets/portada-v4');
const target = path.join(directory, 'llama.svg');
const style = fs.readFileSync(target, 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const image = (name, width = 135, height = 242, extra = '') =>
  `<image width="${width}" height="${height}" preserveAspectRatio="none" ${extra} href="data:image/png;base64,${fs.readFileSync(path.join(directory, name + '.png')).toString('base64')}"/>`;

// Contornos en las coordenadas originales del personaje. Las máscaras eliminan
// los píxeles sueltos del recorte sin perder resolución al ampliar las piezas.
const defs = `<defs>
  <linearGradient id="p4-neck-tone"><stop stop-color="#fff0c5"/><stop offset=".65" stop-color="#eed5ae"/><stop offset="1" stop-color="#c5a47e"/></linearGradient>
  <clipPath id="p4-head-edge"><path d="M19 15L24 12H47.5V44H64.5V16.5L69 14H92.7V51.8L96 54.7V110.5L93.3 114.3V123.7H18V115H11.5V68.5L13.3 65V52.5L19 49Z"/></clipPath>
  <clipPath id="p4-body-edge"><path d="M11.5 116H85.5V131.5L119 134.5V137L121.5 138V148L125 149V182L121.5 183V188L120 189V229.5L105 232L89 229.5V191L64 190L45 189V230L29 233L13 230V188L9.5 186V149L11.5 148Z"/></clipPath>
  <clipPath id="p4-leg-edge"><path d="M51 182L64 179H67L83.2 180.5V204L80 205.5V223.5L66.5 227L51 224.5Z"/></clipPath>
  <clipPath id="p4-arm-edge"><path d="M2 61L3 42L38.5 10.6L48.6 1.8L62.5 6.5L68.4 24L57 34L15.2 63Z"/></clipPath>
</defs>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1702" viewBox="-10 -8 165 260" role="img" aria-label="Llama animada: saludo, mirada y parpadeo">
${style}
${defs}
<path fill="url(#p4-neck-tone)" d="M15 106H88V140H15Z"/>
${image('body', 135, 242, 'clip-path="url(#p4-body-edge)"')}
<g class="p4-leg">${image('front-leg', 135, 242, 'clip-path="url(#p4-leg-edge)"')}</g>
<g class="p4-arm"><g transform="translate(79 99)">${image('wave-arm', 69, 64, 'clip-path="url(#p4-arm-edge)"')}</g></g>
<g class="p4-head"><g transform="scale(.91 1)">
${image('head', 135, 242, 'clip-path="url(#p4-head-edge)"')}
<g class="p4-lid"><path fill="url(#p4-neck-tone)" d="M13 67H25V84H13Z M79 68H90V85H79Z"/><path d="M14 79H24M80 80H89" stroke="#654326" stroke-width="1.3"/></g>
</g></g>
</svg>\n`;
fs.writeFileSync(target, svg);

// El primer fotograma usa las mismas máscaras y alineación que la animación.
const indexPath = path.join(root, 'index.html');
const fallback = `${defs}
<path fill="url(#p4-neck-tone)" d="M15 106H88V140H15Z"/>
<image href="./assets/portada-v4/body.png" width="135" height="242" preserveAspectRatio="none" clip-path="url(#p4-body-edge)"/>
<image href="./assets/portada-v4/front-leg.png" width="135" height="242" preserveAspectRatio="none" clip-path="url(#p4-leg-edge)"/>
<g transform="scale(.91 1)"><image href="./assets/portada-v4/head.png" width="135" height="242" preserveAspectRatio="none" clip-path="url(#p4-head-edge)"/></g>`;
fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replace(/(<svg class="portada-actor"[^>]*>)[\s\S]*?<\/svg>/, `$1\n${fallback}\n      </svg>`));

const manifestPath = path.join(directory, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const { createHash } = require('node:crypto');
for (const entry of manifest.files) {
  const buffer = fs.readFileSync(path.join(root, entry.file));
  entry.sha256 = createHash('sha256').update(buffer).digest('hex');
  entry.bytes = buffer.length;
  if (['head.png', 'body.png', 'front-leg.png', 'wave-arm.png'].includes(path.basename(entry.file))) {
    entry.dimensions = [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
    entry.origin = 'Restauración generativa en alta resolución de la pieza original; contorno depurado en el SVG.';
  }
  if (entry.file.endsWith('/llama.svg')) entry.dimensions = [1080, 1702];
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('SVG de la llama y manifest actualizados.');
