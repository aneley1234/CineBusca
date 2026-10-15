# 🎬 CineBusca

Aplicación web para buscar películas por nombre. Muestra el póster, el título, el año y la calificación de cada resultado, y permite abrir una ventana con los detalles de cada película: sinopsis, duración, género, director, reparto e idioma.

Proyecto escolar con fines educativos. Autor(a): **Cuevas Valdez**.

Repositorio: <https://github.com/aneley1234/CineBusca>

## Funcionalidades

- Búsqueda de películas por nombre con [OMDb API](https://www.omdbapi.com/). Solo se buscan películas, no series.
- Tarjetas con póster, título, año y calificación. La calificación solo aparece si la API la proporciona.
- Ventana de detalles de cada película.
- Indicador de carga mientras se busca. Si la búsqueda tarda más de 3 segundos, aparece un aviso. Si una petición tarda más de 10 segundos, se cancela.
- Mensajes claros para estos casos:
  - campo de búsqueda vacío;
  - búsqueda sin resultados o con demasiados resultados;
  - clave de la API faltante o no válida;
  - límite diario de peticiones alcanzado;
  - error del servidor o respuesta inesperada;
  - falta de conexión.
- Póster de respaldo cuando una película no tiene imagen o la imagen no carga.
- Diseño adaptable a computadoras, tabletas y celulares.

## Tecnologías utilizadas

- **HTML5**: estructura de la página.
- **CSS3**: diseño, variables, Grid, Flexbox, degradados, animaciones y *media queries*.
- **JavaScript**, sin frameworks: `fetch()`, `async/await`, `AbortController` y manipulación del DOM.
- **[OMDb API](https://www.omdbapi.com/)**: datos y pósters de las películas.
- **[Poppins](https://fonts.google.com/specimen/Poppins)** de Google Fonts: tipografía.
- **Git y GitHub**: control de versiones y publicación del código.

## Estructura del proyecto

```
CineBusca/
├── index.html                 Página principal (estructura)
├── css/
│   └── styles.css             Diseño y adaptación a pantallas
├── js/
│   ├── app.js                 Lógica: búsqueda, tarjetas, detalles y errores
│   ├── config.example.js      Modelo del archivo de configuración (sin clave real)
│   └── config.js              Tu clave de la API: lo creas tú y no se sube a GitHub
├── assets/
│   └── img/
│       ├── banner-cine.webp   Imagen de fondo del banner
│       └── sin-poster.svg     Imagen para películas sin póster
├── .gitignore                 Archivos que Git no debe subir
└── README.md
```

## Requisitos

1. Un navegador moderno, como Chrome, Edge o Firefox.
2. Conexión a internet.
3. Una **clave gratuita de OMDb API**. El plan gratuito permite 1,000 peticiones al día.
4. Un servidor local sencillo, por ejemplo:
   - **Python 3**, que ya incluye uno;
   - la extensión **Live Server** de Visual Studio Code.

## Cómo ejecutarla

### 1. Descargar el proyecto

Clona el repositorio con Git:

```bash
git clone https://github.com/aneley1234/CineBusca.git
```

También puedes descargarlo desde GitHub con **Code → Download ZIP** y descomprimirlo.

### 2. Obtener la clave de OMDb

1. Entra a <https://www.omdbapi.com/apikey.aspx>.
2. Elige **FREE**, escribe tu correo y envía el formulario.
3. Abre el correo que te llega. Ahí viene la clave y un enlace para **activarla**. La clave no funciona hasta que la activas.

### 3. Crear el archivo `js/config.js`

El repositorio no incluye `js/config.js`, así que debes crearlo:

1. Copia el archivo `js/config.example.js` y nombra la copia `config.js`, en la misma carpeta `js/`.
2. Abre `js/config.js` y reemplaza `TU_CLAVE_AQUI` por tu clave, sin borrar las comillas:

   ```js
   const API_KEY = 'tu_clave';
   ```

Si `config.js` no existe o todavía tiene `TU_CLAVE_AQUI`, la aplicación muestra el mensaje *"Falta la clave de la API"*.

> **Sobre la seguridad de la clave**
>
> - `js/config.js` está en `.gitignore`. Eso evita que la clave **se suba a GitHub**, pero **no la protege dentro del navegador**.
> - Esta aplicación funciona solo con JavaScript en el navegador. Por eso la clave se envía en la dirección de cada petición a OMDb (parámetro `apikey`).
> - Cualquier persona que use la aplicación puede verla con las herramientas de desarrollador (F12 → pestaña Red / *Network*).
> - Para un proyecto escolar con una clave gratuita es aceptable. En una aplicación real, la clave se guardaría en un servidor intermedio y nunca llegaría al navegador.
> - Por la misma razón, no conviene publicar la aplicación con tu clave en un sitio público.

### 4. Iniciar el servidor local

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
python -m http.server 5500
```

Después abre <http://localhost:5500> en el navegador. En algunas instalaciones de Windows el comando es `py` en lugar de `python`.

Si usas Live Server, haz clic derecho en `index.html` y elige **Open with Live Server**.

### 5. Probarla

1. Escribe el nombre de una película, por ejemplo `batman`. Los títulos en inglés suelen dar mejores resultados.
2. Pulsa **Buscar**.
3. Pulsa la flecha de una tarjeta para ver sus detalles.

## Uso de la API y límites

- **OMDb devuelve los resultados de 10 en 10.** La aplicación muestra solo la primera página, es decir, hasta 10 películas por búsqueda. El número total de coincidencias aparece en la etiqueta de resultados.
- **Cada búsqueda usa como máximo 11 peticiones:**
  - 1 para la lista;
  - 1 por cada película, porque la lista de OMDb no incluye la calificación y hay que pedir los detalles de cada una.
- **Pueden ser menos de 11:**
  - si hay menos resultados;
  - si alguna película ya se consultó antes, mientras no se recargue la página.
- **Abrir los detalles normalmente no gasta otra petición**, porque los datos ya se pidieron para mostrar la calificación y quedan guardados en memoria. Solo se vuelven a pedir si la primera petición falló.
- **Con el plan gratuito (1,000 peticiones al día)** caben al menos **90 búsquedas diarias**: 1,000 ÷ 11 ≈ 90.

## Recursos externos y créditos

| Recurso | Procedencia | Condiciones |
|---|---|---|
| Datos y pósters | [OMDb API](https://www.omdbapi.com/) | Clave gratuita con límite diario. OMDb indica que su contenido tiene licencia [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (uso no comercial, citando la fuente). Los pósters pertenecen a sus respectivos dueños. |
| Tipografía Poppins | Google Fonts | SIL Open Font License 1.1 |
| Iconos (claqueta, lupa, cinta, flecha) | Dibujados con código SVG dentro del proyecto | Creados para este proyecto |
| Imagen del banner | Generada con inteligencia artificial en **ChatGPT** (OpenAI) | Según los [Términos de uso de OpenAI](https://openai.com/policies/terms-of-use/), OpenAI cede al usuario sus derechos sobre el contenido generado, siempre que se cumplan esos términos. Se usa aquí con fines educativos. |

## Declaración de uso de inteligencia artificial

En este proyecto usé dos herramientas de inteligencia artificial, cada una para algo distinto.

### Claude (Anthropic): asistente de programación

Lo usé a través de **Claude Code**, en la aplicación de escritorio de Claude. A partir de mis instrucciones, Claude:

- propuso la estructura de carpetas y escribió la primera versión de la interfaz en HTML y CSS;
- comparó opciones de API de películas e implementó las peticiones a OMDb con `fetch()` y `async/await`;
- agregó el manejo de errores, el indicador de carga y los mensajes para el usuario;
- revisó el código, encontró y corrigió errores, y separó la clave de la API en `js/config.js`;
- rediseñó la interfaz usando como fondo la imagen que yo generé;
- redactó este README;
- ejecutó, con mi autorización, los comandos de Git para crear los commits y subir el proyecto a GitHub.

Claude también probó la aplicación en un navegador integrado y me explicó el código y las correcciones.

### ChatGPT (OpenAI): imagen del banner

Lo usé únicamente para **generar la imagen de fondo del banner** (`assets/img/banner-cine.webp`). La imagen no contiene texto: el título, el subtítulo y el buscador están hechos con HTML y CSS.

### Mi participación

- Escribí las instrucciones (prompts) con los requisitos de cada etapa: funciones, diseño, manejo de errores y entrega.
- Tomé decisiones durante el desarrollo, como mostrar la calificación en las tarjetas aunque cada búsqueda use más peticiones.
- Obtuve y activé mi clave de OMDb y la configuré en el proyecto.
- Generé la imagen del banner en ChatGPT.
- Creé el repositorio en GitHub.
- Ejecuté la aplicación en mi navegador, revisé los resultados y pedí revisiones y correcciones del código.

El detalle de los prompts, los errores encontrados y lo que aprendí se registra en la bitácora de programación con IA, que se entrega por separado.

## Entregables de la tarea

- [x] Enlace al repositorio: <https://github.com/aneley1234/CineBusca>
- [x] README con instrucciones de ejecución y declaración de uso de IA (este archivo)
- [ ] Captura de GitHub Pro activo o del estado de la solicitud, con enlace al perfil: <https://github.com/aneley1234>
- [ ] Bitácora de programación con IA (de una a dos páginas)
- [ ] Demostración en clase o video de máximo 3 minutos
