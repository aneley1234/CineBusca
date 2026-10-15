// app.js
// Lógica de CineBusca: busca películas en OMDb API, crea las tarjetas
// y llena la sección de detalles.

// ===================== CONFIGURACIÓN =====================
// La clave (API_KEY) está en js/config.js, que se carga antes que este archivo.
const API_URL = 'https://www.omdbapi.com/';
const POSTER_RESPALDO = 'assets/img/sin-poster.svg';
const TIEMPO_LIMITE = 10000; // si la API no responde en 10 s, cancelamos la petición
const AVISO_LENTO = 3000;    // a los 3 s avisamos que está tardando

// Error con un mensaje ya preparado para mostrárselo al usuario.
class ErrorBusqueda extends Error {}

// ===================== ELEMENTOS DEL HTML =====================
const formulario = document.getElementById('formulario-busqueda');
const campoBusqueda = document.getElementById('campo-busqueda');
const botonBuscar = formulario.querySelector('button');
const mensaje = document.getElementById('mensaje');
const contenedorPeliculas = document.getElementById('contenedor-peliculas');
const detalles = document.getElementById('detalles');
const contador = document.getElementById('contador');

// La ventana de detalles empieza vacía. Si la página se abre con #detalles
// en la dirección (por ejemplo, al recargar), quitamos el # para que no aparezca vacía.
if (location.hash === '#detalles') {
  history.replaceState(null, '', location.pathname + location.search);
}

// ===================== PETICIONES A LA API =====================

// Hace la petición a OMDb con los parámetros que le pasemos y devuelve los datos.
// Cualquier problema se convierte en un ErrorBusqueda con un mensaje claro.
async function pedirAOmdb(parametros) {
  // Si el navegador ya sabe que no hay internet, ni lo intentamos.
  if (!navigator.onLine) {
    throw new ErrorBusqueda('No tienes conexión a internet. Revisa tu red e inténtalo de nuevo.');
  }

  // Si config.js no existe o no tiene la clave, avisamos en vez de fallar con un error raro.
  // (typeof no falla aunque API_KEY no exista).
  if (typeof API_KEY === 'undefined' || !API_KEY || API_KEY === 'TU_CLAVE_AQUI') {
    throw new ErrorBusqueda('Falta la clave de la API. Crea js/config.js a partir de js/config.example.js.');
  }

  // URLSearchParams arma la parte "?apikey=...&s=..." y codifica espacios y acentos.
  const url = `${API_URL}?${new URLSearchParams({ apikey: API_KEY, ...parametros })}`;

  // AbortController permite cancelar la petición si tarda demasiado.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE);

  try {
    // fetch() envía la petición; await espera a que llegue la respuesta.
    let respuesta;
    try {
      respuesta = await fetch(url, { signal: controlador.signal });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      // fetch() solo lanza error cuando no pudo comunicarse con el servidor.
      throw new ErrorBusqueda('No se pudo conectar con el servidor de películas. Revisa tu conexión a internet.');
    }

    // .json() convierte el texto de la respuesta en un objeto de JavaScript.
    // Si el servidor falla, a veces responde con una página de error que no es JSON.
    let datos;
    try {
      datos = await respuesta.json();
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new ErrorBusqueda(`El servidor de películas tuvo un problema (código ${respuesta.status}). Intenta más tarde.`);
    }

    // Puede llegar JSON válido pero que no sea lo que esperamos (por ejemplo, null).
    if (!datos || typeof datos !== 'object') {
      throw new ErrorBusqueda('El servidor de películas envió una respuesta inesperada. Intenta más tarde.');
    }

    // OMDb indica los errores con Response: "False" y un mensaje en Error.
    if (datos.Response === 'False') {
      throw new ErrorBusqueda(traducirError(datos.Error));
    }
    if (!respuesta.ok) {
      throw new ErrorBusqueda(`El servidor de películas tuvo un problema (código ${respuesta.status}). Intenta más tarde.`);
    }

    return datos;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ErrorBusqueda('La búsqueda tardó demasiado y se canceló. Revisa tu conexión e inténtalo de nuevo.');
    }
    // Cualquier otro error (los nuestros o uno inesperado) sigue su camino sin disfrazarse.
    throw error;
  } finally {
    clearTimeout(temporizador); // ya terminó: apagamos el temporizador
  }
}

// Busca películas por nombre. Devuelve una lista (máximo 10 por página).
async function buscarPeliculas(texto) {
  const datos = await pedirAOmdb({ s: texto, type: 'movie' });
  const peliculas = Array.isArray(datos.Search) ? datos.Search : [];
  if (peliculas.length === 0) {
    throw new ErrorBusqueda(traducirError('Movie not found!'));
  }
  return { peliculas, total: Number(datos.totalResults) || peliculas.length };
}

// Guarda los detalles ya pedidos para no gastar otra petición si se piden de nuevo.
// (Map es como un diccionario: id de la película → datos).
const detallesGuardados = new Map();

// Pide toda la información de una película usando su id de IMDb (ej. tt1375666).
function obtenerDetalles(id) {
  if (!detallesGuardados.has(id)) {
    // Guardamos la promesa: si dos partes del código piden la misma película
    // al mismo tiempo, comparten una sola petición.
    const peticion = pedirAOmdb({ i: id, plot: 'full' });
    detallesGuardados.set(id, peticion);
    // Si falla, la borramos para poder intentarlo otra vez más tarde.
    peticion.catch(() => detallesGuardados.delete(id));
  }
  return detallesGuardados.get(id);
}

// Cambia los mensajes de error de OMDb (en inglés) por mensajes en español.
function traducirError(error) {
  const errores = {
    'Movie not found!': 'No encontramos películas con ese nombre. Prueba con otro título (en inglés suele funcionar mejor).',
    'Too many results.': 'Hay demasiados resultados. Escribe un nombre más específico.',
    'Invalid API key!': 'La clave de la API no es válida. Revisa API_KEY en js/config.js.',
    'No API key provided.': 'Falta la clave de la API. Agrégala en js/config.js.',
    'Request limit reached!': 'Se alcanzó el límite diario de búsquedas (1,000). Intenta mañana.',
    'Incorrect IMDb ID.': 'No se encontró la información de esta película.',
    'Error getting data.': 'El servidor de películas no pudo obtener los datos. Intenta más tarde.'
  };
  return errores[error] || `El servidor de películas respondió con un error: ${error || 'desconocido'}.`;
}

// Mensaje para errores que no esperábamos (por ejemplo, un fallo en nuestro código).
function mensajeDeError(error) {
  if (error instanceof ErrorBusqueda) return error.message;
  console.error(error); // para que lo veas en la consola (F12) y puedas corregirlo
  return 'Ocurrió un error inesperado. Recarga la página e inténtalo de nuevo.';
}

// ===================== MOSTRAR RESULTADOS =====================

// Flecha del botón circular (SVG escrito por nosotros, es un texto fijo y seguro).
const ICONO_FLECHA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// Crea una tarjeta: póster (con lugar para la calificación), título, año y botón circular.
function crearTarjeta(pelicula) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  const nombre = valorOTexto(pelicula.Title, 'Título no disponible');

  const portada = document.createElement('div');
  portada.className = 'tarjeta__portada';

  const poster = document.createElement('img');
  poster.className = 'tarjeta__poster';
  poster.src = obtenerPoster(pelicula.Poster);
  poster.alt = `Póster de ${nombre}`;
  poster.loading = 'lazy'; // carga la imagen solo cuando se va a ver
  ponerPosterDeRespaldo(poster);
  portada.append(poster);

  const info = document.createElement('div');
  info.className = 'tarjeta__info';

  const texto = document.createElement('div');
  texto.className = 'tarjeta__texto';

  const titulo = document.createElement('h3');
  titulo.className = 'tarjeta__titulo';
  titulo.textContent = nombre;

  const anio = document.createElement('p');
  anio.className = 'tarjeta__anio';
  anio.textContent = valorOTexto(pelicula.Year, 'Año desconocido');
  texto.append(titulo, anio);

  // Sin id no podemos pedir los detalles, así que el botón queda desactivado.
  let boton;
  if (tieneValor(pelicula.imdbID)) {
    boton = document.createElement('a');
    boton.className = 'tarjeta__boton';
    boton.href = '#detalles';
    boton.dataset.id = pelicula.imdbID; // guardamos el id para pedir los detalles
    boton.setAttribute('aria-label', `Ver detalles de ${nombre}`);
  } else {
    boton = document.createElement('span');
    boton.className = 'tarjeta__boton tarjeta__boton--inactivo';
    boton.setAttribute('aria-label', 'Detalles no disponibles');
    boton.title = 'Detalles no disponibles';
  }
  boton.innerHTML = ICONO_FLECHA;

  info.append(texto, boton);
  tarjeta.append(portada, info);
  return tarjeta;
}

// Borra las tarjetas anteriores, pone las nuevas y devuelve la lista de tarjetas.
function mostrarPeliculas(peliculas) {
  const tarjetas = peliculas.map(crearTarjeta);
  contenedorPeliculas.replaceChildren(...tarjetas);
  return tarjetas;
}

// Cuenta las búsquedas: así sabemos si una calificación llegó tarde (de una búsqueda vieja).
let ultimaBusqueda = 0;

// La búsqueda de OMDb no trae calificación; hay que pedir los detalles de cada película.
// Las pedimos todas a la vez y cada calificación aparece en su tarjeta cuando llega.
function cargarCalificaciones(peliculas, tarjetas, numeroBusqueda) {
  peliculas.forEach((pelicula, posicion) => {
    if (!tieneValor(pelicula.imdbID)) return;

    obtenerDetalles(pelicula.imdbID)
      .then((datos) => {
        // Si ya se hizo otra búsqueda o la API no da calificación, no mostramos nada.
        if (numeroBusqueda !== ultimaBusqueda || !tieneValor(datos.imdbRating)) return;

        const calificacion = document.createElement('span');
        calificacion.className = 'tarjeta__calificacion';
        calificacion.setAttribute('aria-label', `Calificación ${datos.imdbRating} de 10`);

        const estrella = document.createElement('span');
        estrella.className = 'tarjeta__estrella';
        estrella.setAttribute('aria-hidden', 'true');
        estrella.textContent = '★';

        calificacion.append(estrella, datos.imdbRating);
        tarjetas[posicion].querySelector('.tarjeta__portada').append(calificacion);
      })
      // Si falla, la tarjeta simplemente se queda sin calificación (no es un error grave).
      .catch(() => {});
  });
}

// Muestra u oculta la etiqueta con el número de resultados.
function mostrarContador(total) {
  contador.hidden = !total;
  contador.textContent = total === 1 ? '1 resultado' : `${total} resultados`;
}

// Muestra un texto debajo de "Resultados".
// tipo: 'normal', 'error' (se pinta de rosa) o 'cargando' (con el círculo giratorio).
function mostrarMensaje(texto, tipo = 'normal') {
  mensaje.textContent = texto;
  mensaje.classList.toggle('resultados__mensaje--error', tipo === 'error');
  mensaje.classList.toggle('resultados__mensaje--cargando', tipo === 'cargando');
}

// Activa o desactiva el estado de carga de la búsqueda.
const contenidoBoton = botonBuscar.innerHTML;
function ponerCargando(activo) {
  botonBuscar.disabled = activo;
  botonBuscar.innerHTML = activo ? '<span class="cargador" aria-hidden="true"></span> Buscando...' : contenidoBoton;
  contenedorPeliculas.classList.toggle('rejilla--cargando', activo);
  contenedorPeliculas.setAttribute('aria-busy', activo);
}

// OMDb escribe "N/A" cuando no tiene un dato.
function tieneValor(dato) {
  return Boolean(dato) && dato !== 'N/A';
}

function valorOTexto(dato, textoSiFalta) {
  return tieneValor(dato) ? dato : textoSiFalta;
}

function obtenerPoster(url) {
  return tieneValor(url) ? url : POSTER_RESPALDO;
}

// Si la imagen del póster no carga (enlace roto), mostramos la de respaldo.
function ponerPosterDeRespaldo(imagen) {
  imagen.onerror = () => {
    imagen.onerror = null; // evita un ciclo si la de respaldo también fallara
    imagen.src = POSTER_RESPALDO;
  };
}

// ===================== MOSTRAR DETALLES =====================

// Llena la ventana de detalles (que ya existe en el HTML) con los datos de la película.
function mostrarDetalles(pelicula) {
  const valor = (dato) => valorOTexto(dato, 'No disponible');
  const nombre = valorOTexto(pelicula.Title, 'Título no disponible');

  const poster = detalles.querySelector('.detalles__poster');
  ponerPosterDeRespaldo(poster);
  poster.src = obtenerPoster(pelicula.Poster);
  poster.alt = `Póster de ${nombre}`;

  detalles.querySelector('.detalles__titulo').textContent = nombre;
  detalles.querySelector('.detalles__texto').textContent = valorOTexto(pelicula.Plot, 'Esta película no tiene sinopsis disponible.');

  // Etiquetas: año, duración, género y calificación (solo las que existan).
  const etiquetas = [pelicula.Year, pelicula.Runtime, pelicula.Genre]
    .filter(tieneValor)
    .map((dato) => {
      const li = document.createElement('li');
      li.className = 'etiqueta';
      li.textContent = dato;
      return li;
    });

  if (tieneValor(pelicula.imdbRating)) {
    const calificacion = document.createElement('li');
    calificacion.className = 'etiqueta etiqueta--calificacion';
    calificacion.textContent = `⭐ ${pelicula.imdbRating}`;
    etiquetas.push(calificacion);
  }
  detalles.querySelector('.detalles__etiquetas').replaceChildren(...etiquetas);

  // Director, reparto e idioma (los <dd> en el mismo orden que en el HTML).
  const [director, reparto, idioma] = detalles.querySelectorAll('.detalles__datos dd');
  director.textContent = valor(pelicula.Director);
  reparto.textContent = valor(pelicula.Actors);
  idioma.textContent = valor(pelicula.Language);
}

// ===================== EVENTOS =====================

// Cuando se envía el formulario (clic en Buscar o tecla Enter).
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // evita que la página se recargue

  // trim() quita los espacios, así "   " también cuenta como vacío.
  const texto = campoBusqueda.value.trim();
  if (!texto) {
    mostrarMensaje('Escribe el nombre de una película antes de buscar.', 'error');
    campoBusqueda.classList.add('buscador__campo--error');
    campoBusqueda.focus();
    return;
  }

  const numeroBusqueda = ++ultimaBusqueda;
  ponerCargando(true);
  mostrarContador(0);
  mostrarMensaje(`Buscando "${texto}"...`, 'cargando');
  // Si a los 3 segundos no ha terminado, avisamos que va lento.
  const avisoLento = setTimeout(() => {
    mostrarMensaje('La búsqueda está tardando más de lo normal. Espera un momento...', 'cargando');
  }, AVISO_LENTO);

  try {
    const { peliculas, total } = await buscarPeliculas(texto);
    const tarjetas = mostrarPeliculas(peliculas);
    mostrarContador(total);
    const mostrando = total > peliculas.length ? ` Mostrando los primeros ${peliculas.length}.` : '';
    mostrarMensaje(`Resultados para "${texto}".${mostrando}`);
    // No usamos await: las tarjetas ya se ven y las calificaciones van llegando.
    cargarCalificaciones(peliculas, tarjetas, numeroBusqueda);
  } catch (error) {
    contenedorPeliculas.replaceChildren(); // quitamos las tarjetas viejas
    mostrarMensaje(mensajeDeError(error), 'error');
  } finally {
    // se ejecuta siempre, haya error o no
    clearTimeout(avisoLento);
    ponerCargando(false);
  }
});

// En cuanto el usuario vuelve a escribir, quitamos el borde rojo del campo.
campoBusqueda.addEventListener('input', () => {
  campoBusqueda.classList.remove('buscador__campo--error');
});

// Cuenta las peticiones de detalles: solo mostramos la del último clic.
let ultimaPeticionDetalles = 0;

// Un solo "escuchador" para todos los botones "Ver detalles",
// incluso los de tarjetas que se crean después (delegación de eventos).
contenedorPeliculas.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('.tarjeta__boton');
  if (!boton) return;
  evento.preventDefault();
  if (!boton.dataset.id) return; // botón desactivado: la película no tiene id
  if (boton.classList.contains('tarjeta__boton--cargando')) return; // evita pedirlo dos veces

  // La clase cambia la flecha por un círculo que gira (ver CSS).
  boton.classList.add('tarjeta__boton--cargando');
  boton.setAttribute('aria-busy', 'true');
  const numeroPeticion = ++ultimaPeticionDetalles;

  try {
    const pelicula = await obtenerDetalles(boton.dataset.id);
    // Si mientras esperábamos el usuario pidió otra película, ignoramos esta respuesta.
    if (numeroPeticion !== ultimaPeticionDetalles) return;
    mostrarDetalles(pelicula);
    location.hash = 'detalles'; // abre la ventana (el CSS usa :target)
  } catch (error) {
    if (numeroPeticion !== ultimaPeticionDetalles) return;
    mostrarMensaje(mensajeDeError(error), 'error');
    // El mensaje está arriba; lo traemos a la vista por si el usuario bajó en la página.
    mensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    boton.classList.remove('tarjeta__boton--cargando');
    boton.removeAttribute('aria-busy');
  }
});
