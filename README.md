# Portafolio
Portafolio de trabajo básico el cual será desarrollado en mi tiempos libres.

## Estructura

Sitio estático en HTML y CSS, sin compilación ni gestor de dependencias.

- `index.html`: presentación, proyectos destacados, conocimientos y contacto de demostración.
- `proyectos.html`: catálogo de proyectos.
- `css/all.css`: variables de color, tipografía, reset y clase compartida `.btn`.
- `css/Page.css`: estilos de la página principal (respetar la mayúscula del nombre).
- `css/proyectos.css`: estilos del catálogo; contiene reglas similares a las de la portada, pero se carga por separado.
- `assets/`: imágenes y currículum en PDF.

## Ejecución local

Con Python 3 disponible, desde la raíz:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8080/` o `http://127.0.0.1:8080/proyectos.html`. Detener con `Ctrl+C`. No se necesita instalar paquetes.

La portada carga `css/all.css` y `css/Page.css` locales, por lo que permite previsualizar sus cambios. **Limitaciones actuales:** el catálogo mantiene referencias CSS publicadas y las imágenes siguen usando URL publicadas. La fuente Montserrat y los iconos Font Awesome también se cargan desde servicios externos. No es una vista autónoma sin conexión.

Además, `index.html` carga Axios y ejecuta al abrirse una consulta a una API en `localhost:8000`, con una cabecera de autorización incrustada. No es necesaria para mostrar el portafolio ni debe reutilizarse para contacto. Para una revisión sin esa petición, bloquearla en el navegador antes de abrir la página. No levantar esa API ni usar la credencial; su tratamiento requiere una revisión separada.

## Convenciones de estilo e integración

- HTML en español (`lang="es"`), UTF-8 y etiqueta viewport en ambas páginas.
- Cargar primero `all.css` y después la hoja específica de la página.
- Reutilizar las variables existentes: `--primary` (`#5C69FF`), `--primary-pre-dark` (`#6648E8`) y `--gray-ligth` (`#f0f0f0`, nombre actual). La tipografía global es Montserrat con alternativa sans-serif.
- `.section-portafolio` organiza secciones en columna; `.name-section` presenta su título. En la portada, el fondo y el color del título dependen de `:nth-child`, que cuenta todos los elementos hermanos: insertar o envolver secciones puede cambiar la alternancia.
- `.btn` aporta espaciado, flex y esquinas redondeadas; los colores se añaden con clases específicas como `.button-hoja-de-vida` o `.proyecto-button`. Los estilos de campos y foco visible de Contacto se definen en `.contacto-campos`, y el estado deshabilitado del botón en `.contacto-enviar:disabled`, dentro de `css/Page.css`. La clase global `.btn` elimina el contorno, por lo que reutilizarla en controles habilitados exige definir un foco visible.
- Las tarjetas usan fondos blancos, radios de 4 px y sombra al pasar el puntero. El diseño emplea flexbox y media queries en 1313, 1124, 980, 769, 410 y 345 px. A 980 px o menos, las tarjetas pasan a una columna y las secciones dejan de tener altura fija; en escritorio `.section-portafolio` tiene `height: 100vh`.

### Contacto de demostración

La sección Contacto está en `index.html`, después de Conocimientos y antes de los scripts. Usa `.section-portafolio` y `.name-section` y estilos específicos en `css/Page.css`, con altura ajustada al contenido y campos en una columna de ancho adaptable.

Incluye Nombre (texto), Correo electrónico (email) y Mensaje (área de texto), con etiquetas visibles asociadas y foco visible. El botón **Enviar** está deshabilitado y el aviso indica **«Demostración: no se envían datos»**. Los campos son una agrupación semántica sin formulario: no hay envío implícito, API, correo ni almacenamiento. No se reutiliza Axios ni se añaden servicios externos.

## Comprobaciones

Ejecutar `python3 -m unittest discover -s tests -v` para comprobar el contrato estático de Contacto: ubicación, etiquetas y tipos, aviso, botón deshabilitado, ausencia de mecanismos de envío en la sección y carga de CSS local. Solo usa la biblioteca estándar; no ejecuta JavaScript ni accede a la API preexistente.

Revisar también el diff con `git diff --check`. No hay configuración de build ni validador HTML/CSS incluidos. Queda comprobar en navegador escritorio y móvil, navegación por teclado, foco y ausencia de desbordamientos. Las pruebas estáticas no sustituyen esa revisión visual y funcional; bloquear antes la petición preexistente indicada arriba.
