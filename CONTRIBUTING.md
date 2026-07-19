# Guía de contribución

## Flujo recomendado

1. Crea una rama corta desde `master` (por ejemplo, `fix/seek-keyboard`).
2. Ejecuta la demo con un servidor HTTP local.
3. Realiza cambios pequeños y enfocados.
4. Verifica manualmente todos los controles y revisa la consola del navegador.
5. Actualiza README o arquitectura si cambia el comportamiento.
6. Abre un pull request explicando el problema, la solución y cómo se probó.

## Convenciones

- HTML, CSS y JavaScript: dos espacios de indentación y archivos UTF-8 con LF.
- Archivos: minúsculas y `kebab-case`, salvo recursos de terceros que requieran su
  nombre original.
- JavaScript: evita nuevas variables globales y valida datos antes de escribir en el
  DOM.
- Commits: mensajes imperativos y concretos, por ejemplo `Fix alternate audio path`.
- Dependencias: no agregues una librería para resolver algo pequeño que pueda hacerse
  con APIs estándar del navegador.

## Lista mínima de verificación

- [ ] La primera pista carga sin errores.
- [ ] Play/pausa actualiza audio e icono.
- [ ] Anterior y siguiente cambian audio, nombre y carátula.
- [ ] La barra refleja el avance y permite buscar con ratón y teclado.
- [ ] El final de una pista avanza según el comportamiento documentado.
- [ ] No hay errores ni solicitudes 404 en la consola/red.
- [ ] Los recursos nuevos tienen licencia o permiso documentado.
