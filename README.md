# Portafolio
Portafolio de trabajo básico el cual será desarrollado en mi tiempos libres.

## Estructura

Sitio estático en HTML y CSS, sin compilación ni gestor de dependencias.

- `index.html`: presentación, proyectos destacados y conocimientos.
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

**Limitaciones actuales:** los HTML enlazan las hojas CSS y las imágenes mediante URL publicadas, no los archivos locales. Servir el checkout no permite previsualizar automáticamente cambios en `css/`; para una futura integración habrá que revisar esas referencias. La fuente Montserrat y los iconos Font Awesome también se cargan desde servicios externos. No es una vista autónoma sin conexión.

Además, `index.html` carga Axios y ejecuta al abrirse una consulta a una API en `localhost:8000`, con una cabecera de autorización incrustada. No es necesaria para mostrar el portafolio ni debe reutilizarse para contacto. Para una revisión sin esa petición, bloquearla en el navegador antes de abrir la página. No levantar esa API ni usar la credencial; su tratamiento requiere una revisión separada.

## Convenciones de estilo e integración

- HTML en español (`lang="es"`), UTF-8 y etiqueta viewport en ambas páginas.
- Cargar primero `all.css` y después la hoja específica de la página.
- Reutilizar las variables existentes: `--primary` (`#5C69FF`), `--primary-pre-dark` (`#6648E8`) y `--gray-ligth` (`#f0f0f0`, nombre actual). La tipografía global es Montserrat con alternativa sans-serif.
- `.section-portafolio` organiza secciones en columna; `.name-section` presenta su título. En la portada, el fondo y el color del título dependen de `:nth-child`, que cuenta todos los elementos hermanos: insertar o envolver secciones puede cambiar la alternancia.
- `.btn` aporta espaciado, flex y esquinas redondeadas; los colores se añaden con clases específicas como `.button-hoja-de-vida` o `.proyecto-button`. No hay componentes de formulario ni estilos de campos, foco o estado deshabilitado existentes. `.btn` elimina el contorno, por lo que reutilizarla exige definir un foco visible para controles interactivos.
- Las tarjetas usan fondos blancos, radios de 4 px y sombra al pasar el puntero. El diseño emplea flexbox y media queries en 1313, 1124, 980, 769, 410 y 345 px. A 980 px o menos, las tarjetas pasan a una columna y las secciones dejan de tener altura fija; en escritorio `.section-portafolio` tiene `height: 100vh`.

### Futura sección de contacto

Ubicación propuesta: en `index.html`, después de Conocimientos y antes de los scripts, como sección hermana de las existentes. Añadir sus estilos específicos en `css/Page.css`, sin cargar `css/proyectos.css` ni alterar el catálogo. Usar `.section-portafolio` y `.name-section` como base visual, con una clase específica para ajustar la altura al contenido y evitar desbordamientos.

La integración pendiente debe incluir Nombre, Correo electrónico y Mensaje con etiquetas visibles asociadas a sus controles, distribución adaptable, botón **Enviar** con atributo `disabled` y aviso visible **«Demostración: no se envían datos»**. Mantener los colores y la tipografía existentes; definir bordes de campos y estados accesibles sin depender solo del color. No añadir envío, API, correo, almacenamiento ni servicios externos, ni reutilizar el script de Axios. Esta sección todavía no está implementada.

## Comprobaciones

No hay una suite de pruebas, configuración de build ni validador HTML/CSS incluidos. Para cambios futuros, revisar el diff con `git diff --check`, comprobar las rutas locales y verificar en navegador escritorio y móvil, navegación por teclado, etiquetas, foco, ausencia de desbordamientos y que la demostración no envíe ni almacene datos. La inspección del código no sustituye esa revisión visual y funcional.
