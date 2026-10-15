# 🎬 CineBusca

Aplicación web para buscar películas por nombre. Muestra el póster, el título, el año y la calificación de cada resultado, y permite abrir una ventana con los detalles: sinopsis, duración, género, director, reparto e idioma.

Proyecto escolar con fines educativos. Autor(a): **Cuevas Valdez**.

## Funcionalidades

- Búsqueda de películas por nombre con [OMDb API](https://www.omdbapi.com/).
- Tarjetas con póster, título, año y calificación. La calificación solo aparece si la API la proporciona.
- Ventana de detalles de cada película.
- Indicador de carga y aviso cuando la búsqueda tarda más de 3 segundos. Si pasan 10 segundos, la petición se cancela.
- Mensajes claros para estos casos:
  - campo vacío;
  - búsqueda sin resultados;
  - clave inválida;
  - límite diario alcanzado;
  - error del servidor;
  - falta de conexión.
- Póster de respaldo cuando una película no tiene imagen.
- Diseño adaptable a computadoras, tabletas y celulares.

## Tecnologías utilizadas

- **HTML5**: estructura de la página.
- **CSS3**: diseño, variables, Grid, Flexbox, degradados, animaciones y *media queries*.
- **JavaScript**, sin frameworks: `fetch()`, `async/await`, `AbortController` y manipulación del DOM.
- **[OMDb API](https://www.omdbapi.com/)**: datos y pósters de las películas.
- **[Poppins](https://fonts.google.com/specimen/Poppins)** de Google Fonts: tipografía, con licencia SIL Open Font License.

## Estructura del proyecto

```
Tarea3_CuevasValdez/
├── index.html               Página principal (estructura)
├── css/
│   └── styles.css           Diseño y adaptación a pantallas
├── js/
│   ├── app.js               Lógica: búsqueda, tarjetas, detalles y errores
│   ├── config.example.js    Modelo del archivo de configuración
│   └── config.js            Tu clave de la API (NO se sube a GitHub)
├── assets/
│   └── img/
│       ├── banner-cine.webp Imagen de fondo del banner
│       └── sin-poster.svg   Imagen para películas sin póster
├── .gitignore               Archivos que Git no debe subir
└── README.md
```

## Requisitos

1. Un navegador moderno, como Chrome, Edge o Firefox.
2. Conexión a internet.
3. Una **clave gratuita de OMDb API**. Permite 1,000 peticiones al día.
4. Un servidor local sencillo. Puede ser cualquiera de estos:
   - **Python 3**: ya incluye un servidor;
   - la extensión **Live Server** de Visual Studio Code.

## Cómo ejecutarla

### 1. Obtener la clave de OMDb

1. Entra a <https://www.omdbapi.com/apikey.aspx>.
2. Elige **FREE**, escribe tu correo y envía el formulario.
3. Abre el correo que te llega. Ahí viene la clave; haz clic en el enlace para **activarla**.

### 2. Configurar la clave

1. Copia el archivo `js/config.example.js` y nombra la copia `js/config.js`.
2. Abre `js/config.js` y reemplaza `TU_CLAVE_AQUI` por tu clave:

   ```js
   const API_KEY = 'tu_clave';
   ```

> `js/config.js` está en `.gitignore`, así que tu clave no se sube a GitHub.
> Como la aplicación funciona solo en el navegador, la clave sí se puede ver en las herramientas de desarrollador (F12). Para un proyecto escolar es aceptable. En una aplicación real se usaría un servidor intermedio.

### 3. Iniciar el servidor local

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
python -m http.server 5500
```

Después abre <http://localhost:5500> en el navegador. Si usas Live Server, haz clic derecho en `index.html` y elige **Open with Live Server**.

### 4. Probarla

Escribe el nombre de una película, por ejemplo `batman`. Los títulos en inglés funcionan mejor. Pulsa **Buscar** y luego la flecha de una tarjeta para ver sus detalles.

## Uso de la API y límites

- Cada búsqueda usa **11 peticiones**: 1 para la lista y 1 por cada película, para obtener su calificación.
- Los detalles que ya se pidieron se guardan en memoria. Por eso abrir "Ver detalles" no gasta otra petición.
- Con el plan gratuito (1,000 peticiones al día) caben unas **90 búsquedas diarias**.

## Recursos externos y créditos

| Recurso | Procedencia | Condiciones |
|---|---|---|
| Datos y pósters | [OMDb API](https://www.omdbapi.com/) | Clave gratuita con límite diario. Los pósters pertenecen a sus respectivos dueños. |
| Tipografía Poppins | Google Fonts | SIL Open Font License 1.1 |
| Iconos (claqueta, lupa, cinta, flecha) | Dibujados con código SVG dentro del proyecto | Propios |
| Imagen del banner | Generada con inteligencia artificial en **ChatGPT** (OpenAI) | Según los [Términos de uso de OpenAI](https://openai.com/policies/terms-of-use/), OpenAI cede al usuario sus derechos sobre el contenido generado, siempre que se cumplan esos términos. Se usa aquí con fines educativos. |

## Declaración de uso de inteligencia artificial

Durante el desarrollo utilicé **Claude**, de Anthropic, a través de **Claude Code** en la aplicación de escritorio de Claude, como asistente de programación. La usé para:

- proponer la estructura de carpetas y la primera versión de la interfaz en HTML y CSS;
- investigar opciones de API de películas e implementar las peticiones con `fetch()` y `async/await`;
- agregar el manejo de errores, el indicador de carga y los mensajes para el usuario;
- revisar el código en busca de errores y problemas de seguridad con la clave de la API;
- rediseñar la interfaz a partir de una imagen de fondo que yo proporcioné;
- preparar este README y el guion de la presentación.

También utilicé **ChatGPT**, de OpenAI, para **generar la imagen de fondo del banner** (`assets/img/banner-cine.webp`). La imagen no contiene texto; el título, el subtítulo y el buscador están hechos con HTML y CSS.

Revisé las respuestas, probé la aplicación en el navegador y pedí correcciones cuando algo no funcionaba. El proceso completo, con los prompts, los errores encontrados y lo que aprendí, está en mi bitácora de programación con IA.
