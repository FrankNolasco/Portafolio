# Verificación de navegación de la landing

## Alcance y estado inicial

No se encontraron AGENTS.md dentro del checkout. Se revisaron README.md,
index.html, css/Page.css, css/all.css y el diff previo. Ya estaban modificados
index.html y css/Page.css; opencode.json estaba sin seguimiento y no se tocó.

## Correcciones de esta revisión

- Las tres secciones tienen mínimo 100vh, mejorado a 100dvh cuando está
  disponible, sin restar el menú. Conservan altura automática para el contenido.
- Los enlaces tienen foco visible explícito, incluidos los botones cuyo estilo
  compartido elimina el outline. El menú conserva su indicador blanco interior.
- Los tres destinos admiten foco con tabindex="-1", sin añadir paradas a Tab,
  para facilitar la navegación nativa mediante fragmentos.

## Evidencia ejecutada

- `git status --short`: dos archivos previamente modificados y opencode.json
  sin seguimiento.
- `find . -name AGENTS.md -not -path './node_modules/*' -not -path './.git/*'`:
  sin resultados.
- `command -v chromium || command -v firefox || true`: sin resultados.
- `node --version`: v24.21.0. `python3 --version`: Python 3.10.12.
- `python3 - <<'PY' … PY`: comprobación mediante HTMLParser y aserciones;
  resultado: «OK: tres enlaces, IDs únicos, destinos enfocables y contratos CSS
  estáticos». Se contrastaron exactamente #inicio, #proyectos y #conocimientos,
  destinos con tabindex=-1 y enlaces sin tabindex; presencia de sticky/top/z-index,
  scroll-padding, smooth condicionado a no-preference, auto para reduce, foco
  visible y mínimos 100vh/100dvh. También se comprobó que Page.css no contiene
  overflow:hidden, display:none ni visibility:hidden.
- `git diff --check`: salida vacía, código 0.

## Lectura estática y límites

El menú usa sticky con top:0 y z-index:10; no hay ancestros con overflow que lo
limiten. scroll-padding-top reserva su altura más 1rem al navegar por fragmentos.
En móvil hasta 480px el menú se apila en tres filas de 3rem; en escritorio usa
4rem. Los enlaces nativos conservan activación por Enter y orden DOM para Tab.
Las tarjetas y secciones permiten crecimiento y ajuste de texto sin recorte
explícito. Reduced motion desactiva el desplazamiento suave.

Estos resultados son estáticos, no una validación visual ni de comportamiento
real. Pendiente en el navegador administrado: activar los tres enlaces con ratón
y teclado; confirmar foco y siguiente Tab; medir cada sección frente al viewport;
comprobar menú persistente y contenido sin solapamiento/desbordamiento en móvil,
escritorio, zoom y orientación horizontal; emular reduced motion y comprobar
ausencia de animación de scroll. No se instalaron dependencias ni navegadores.
