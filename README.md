# Portafolio
Portafolio de demostración con proyectos y contenido ficticios.

## Compilar y abrir localmente

Requiere Node.js, npm y Python 3 para el servidor de ejemplo:

```sh
npm ci
npm run build:static
python3 -m http.server 8000 --directory dist
```

Abrir http://localhost:8000/. `npm test` ejecuta las pruebas disponibles.

`dist/` contiene únicamente las dos páginas y los recursos del rediseño,
seleccionados explícitamente en `scripts/build-static.cjs`. Sus rutas relativas
permiten servirlo también bajo el prefijo de un proyecto de GitHub Pages.
La compilación local no publica el sitio ni configura su despliegue. No se debe
publicar la raíz del repositorio: conserva recursos heredados fuera de la salida.
