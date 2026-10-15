# Guion de presentación: CineBusca (máximo 3 minutos)

**Antes de empezar**

1. Inicia el servidor con `python -m http.server 5500`.
2. Abre `http://localhost:5500` y recarga con Ctrl + F5.
3. Ten abierto `js/app.js` en tu editor, en la función `pedirAOmdb()`.
4. Haz una búsqueda de prueba para confirmar que tu clave funciona. Así no te llevas sorpresas frente al grupo.

---

## 1. Presentación (0:00 – 0:20)

> "Les presento CineBusca, una aplicación web para buscar películas. La hice con HTML, CSS y JavaScript, sin frameworks. Los datos vienen de una API externa llamada OMDb."

## 2. Demostración (0:20 – 1:30)

| Acción en pantalla | Qué decir |
|---|---|
| Pulsa **Buscar** con el campo vacío. | "Primero, si intento buscar sin escribir nada, la aplicación me avisa en lugar de hacer una petición inútil." |
| Escribe `batman` y pulsa **Buscar**. | "Ahora busco una película. Mientras espera la respuesta, el botón muestra un indicador de carga." |
| Señala las tarjetas y la etiqueta del contador. | "Aparecen las tarjetas con póster, título y año. La etiqueta indica cuántos resultados encontró la API. Las calificaciones van apareciendo poco a poco porque se piden por separado." |
| Pulsa la flecha de una tarjeta. | "Con la flecha abro los detalles: sinopsis, duración, género, director y reparto. Todos son datos reales de la API." |
| Cierra la ventana y busca `qzxwvkjh`. | "Si busco algo que no existe, muestra un mensaje claro en vez de dejar la página vacía." |
| Pulsa F12 → **Ctrl + Shift + M** y elige un celular *(opcional)*. | "Y el diseño se adapta a celulares: el buscador se acomoda en dos líneas y las tarjetas en dos columnas." |

## 3. Explicación del código: `pedirAOmdb()` en `js/app.js` (1:30 – 2:40)

Muestra la función en el editor y señala cada parte mientras hablas.

```js
async function pedirAOmdb(parametros) {
  ...
  const url = `${API_URL}?${new URLSearchParams({ apikey: API_KEY, ...parametros })}`;
  ...
  respuesta = await fetch(url, { signal: controlador.signal });
  ...
  datos = await respuesta.json();
  ...
  if (datos.Response === 'False') {
    throw new ErrorBusqueda(traducirError(datos.Error));
  }
  return datos;
}
```

> "Esta es la función que se comunica con la API.
>
> Primero, `URLSearchParams` arma la dirección con mi clave y lo que el usuario escribió.
>
> Después, `fetch()` envía la petición a internet. Como la respuesta tarda, uso `await`: la función espera sin congelar la página. Por eso lleva la palabra `async`.
>
> Cuando llega la respuesta, `.json()` convierte el texto en un objeto de JavaScript que puedo usar.
>
> OMDb avisa los errores con `Response: "False"`. En ese caso lanzo un error con un mensaje en español, por ejemplo 'No encontramos películas con ese nombre'.
>
> Además, un `AbortController` cancela la petición si tarda más de 10 segundos. Y si `fetch` falla, sé que es un problema de conexión."

## 4. Cierre (2:40 – 3:00)

> "La clave de la API está en un archivo aparte, `config.js`, que no se sube a GitHub. Usé inteligencia artificial como asistente, pero revisé y probé cada cambio. Por ejemplo, en una revisión encontramos un error: si pedías los detalles de dos películas muy rápido, a veces se mostraba la equivocada. Lo corregimos numerando cada petición. Gracias."

> ⚠️ Cambia este ejemplo de cierre por el error real que tú detectaste y anotaste en tu bitácora.

---

**Consejos**

- Practica con cronómetro; la sección 3 es la más importante.
- Si falla internet durante la presentación, aprovéchalo: muestra el mensaje de error de conexión como parte de la demostración.
- Si te preguntan algo que no sabes, busca la línea en `app.js`; todos los comentarios están en español.
