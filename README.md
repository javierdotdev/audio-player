# Audio Player

Reproductor web compacto con lista de canciones, controles de reproducción,
cambio de pista, barra de progreso y transición de carátulas. Es una aplicación
estática: no necesita backend, base de datos ni proceso de compilación.

> **Estado:** proyecto legado funcional, creado en 2015 y organizado como base de
> mantenimiento. Antes de redistribuir la demo públicamente, revisa la sección
> [Licencias y archivos multimedia](#licencias-y-archivos-multimedia).

## Funcionalidades

- Reproducción y pausa mediante HTML5 Audio.
- Pista anterior y siguiente con recorrido circular.
- Avance automático al terminar una canción, excepto al finalizar la lista.
- Búsqueda dentro de la pista con ratón o flechas izquierda/derecha.
- Indicadores visuales de carga y error.
- Cambio animado de carátula entre canciones.
- Recursos locales: la demo no depende de CDN ni servicios externos.

## Ejecutar localmente

Puedes abrir `index.html` directamente, aunque se recomienda usar un servidor
estático para reproducir el mismo contexto que tendrá en GitHub Pages:

```bash
python -m http.server 8080
```

Después abre <http://localhost:8080>.

La aplicación no necesita instalar dependencias para ejecutarse. Las dependencias npm
son exclusivamente para las pruebas de desarrollo:

```bash
npm install
npm test
```

## Estructura

```text
audio-player/
├── audio/                  # Archivos de demostración
├── font/                   # Fuentes de Font Awesome 3.2.1
├── images/                 # Carátulas de la lista
├── javascripts/
│   └── all.js              # Reproductor en JavaScript nativo
├── stylesheets/            # Font Awesome y estilos de la interfaz
├── tests/                   # Smoke tests del reproductor
├── docs/ARCHITECTURE.md    # Flujo interno y decisiones técnicas
├── index.html              # Punto de entrada
└── LICENSE                 # Licencia MIT del software propio
```

## Personalizar la lista

La lista está definida al inicio de `javascripts/all.js`, en la constante `TRACKS`.
Cada elemento usa este formato:

```javascript
{
  image: "images/cover.jpg",
  name: "Artista - Canción",
  sources: [
    { src: "audio/song.mp3", type: "audio/mpeg" }
  ]
}
```

Mantén los nombres de archivo en minúsculas y `kebab-case`, usa rutas relativas y
declara el MIME correcto. Puedes añadir varias fuentes para una canción cuando sean
formatos alternativos del mismo audio.

## Lineamientos base

- Mantener `index.html` como única entrada y evitar dependencias remotas.
- Preferir las APIs estándar del navegador y mantener el reproductor sin dependencias
  JavaScript de terceros.
- No mezclar archivos multimedia en la raíz; deben ir en `audio/` o `images/`.
- Conservar la aplicación utilizable sin un paso de compilación.
- Probar reproducción, pausa, anterior, siguiente, búsqueda y fin de pista antes de
  integrar cambios.
- Usar HTML semántico, etiquetas accesibles y navegación por teclado.
- Documentar toda dependencia o recurso de terceros en
  `THIRD_PARTY_NOTICES.md`.
- No subir canciones, imágenes o fuentes sin comprobar su permiso de redistribución.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) y
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para el flujo de trabajo completo.

## Publicar en GitHub

El proyecto puede servirse directamente con GitHub Pages desde la raíz del
repositorio. Antes de activarlo:

1. Sustituye o acredita correctamente los audios y carátulas cuya licencia no esté
   demostrada.
2. Prueba el sitio mediante HTTP en Chrome, Firefox y Edge actuales.
3. Revisa que `git status` solo contenga los cambios que deseas publicar.
4. Configura la descripción, los topics (`audio-player`, `html5-audio`, `javascript`)
   y una captura de pantalla en el repositorio.

## Licencias y archivos multimedia

Las contribuciones de software propias se publican bajo la [licencia MIT](LICENSE).
Las dependencias incluidas conservan sus respectivas licencias; consulta
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

La licencia y procedencia de las canciones de Sunhawk y de sus carátulas no puede
determinarse únicamente con los archivos del repositorio. **No se consideran
automáticamente cubiertas por MIT.** Antes de una nueva publicación pública, confirma
que tienes permiso para redistribuirlas o reemplázalas por muestras propias, CC0 o con
una licencia compatible.

## Autor

Javier E. Martinez.
