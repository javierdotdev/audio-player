# Arquitectura

## Resumen

Audio Player es una aplicación estática de una sola página. `index.html` carga los
estilos y `javascripts/all.js`, sin framework ni dependencias JavaScript. El
reproductor crea en tiempo de ejecución un elemento `<audio>` y lo conecta con la
interfaz existente.

```text
Lista `TRACKS`
      |
      v
AudioPlayer    ---- actualiza ----> DOM, carátula y barra
      |
      +---------------------------> HTMLAudioElement
                                      |
                                      v
                                archivos en audio/
```

## Responsabilidades

### `AudioPlayer`

Encapsula el elemento nativo de audio y toda la coordinación de la interfaz. Mantiene
el índice activo, actualiza fuentes y carátulas, conecta los controles y refleja
carga, error, reproducción y progreso en el DOM.

### Lista `TRACKS`

Es la configuración del contenido. Cada canción declara nombre, imagen y una o más
fuentes equivalentes con su MIME. El orden del arreglo define el orden de navegación.

## Flujo de reproducción

1. La inicialización selecciona la canción cero.
2. `goToSong()` cambia fuentes, imagen y nombre, y llama a `audio.load()`.
3. Play/pausa delega en el elemento HTML5 Audio.
4. `timeupdate` calcula el porcentaje y actualiza la barra.
5. `ended` avanza a la siguiente canción cuando existe.

## Compatibilidad y decisiones

- `all.js` usa JavaScript nativo y no expone dependencias de ejecución.
- `window.audioPlayer` conserva una referencia a la instancia para facilitar
  diagnóstico desde la consola.
- Los archivos se sirven con rutas relativas, por lo que funcionan localmente, en un
  servidor estático y en GitHub Pages.
- La reproducción siempre comienza por una acción del usuario para respetar las reglas
  de autoplay del navegador.

## Deuda técnica conocida

- Font Awesome 3.2.1 sigue siendo una dependencia visual antigua y vendorizada.
- No existe todavía una suite automatizada persistente en el repositorio.
- Los archivos multimedia dominan el tamaño del proyecto.
- Falta demostrar la licencia de redistribución de audios, carátulas y parte del estilo
  histórico.

La siguiente mejora recomendada es reemplazar Font Awesome por SVG locales y añadir
pruebas de navegador para los controles principales.
