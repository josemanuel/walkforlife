# WalkForLife — Proyecto de migración a Joomla

Este directorio contiene el traspaso completo del proyecto **WalkForLife** (y su suite de herramientas asociadas) desde su fase 1 — apps estáticas single-file alojadas en GitHub Pages — hacia la fase 2: un sitio **Joomla 6** con gestión de usuarios, pensado como base para un modelo de suscripción de pago.

## Cómo orientarte

| Archivo | Para qué sirve | Cuándo leerlo |
|---|---|---|
| `CLAUDE.md` | Instrucciones de proyecto: convenciones de código, mapa del código existente, errores ya cometidos y a no repetir | **Primero, siempre** — es el contexto operativo para trabajar en el código |
| `HANDOFF.md` | Historia completa de cómo se construyó todo, inventario de archivos, próximos pasos y preguntas abiertas | Para entender *por qué* las cosas están como están |
| `ARCHITECTURE.md` | Arquitectura actual vs. objetivo, requisitos técnicos de Joomla 6 verificados, opciones de integración con sus pros/contras, consideraciones de protección de datos | Antes de tomar decisiones de diseño técnico |

## Archivos de la aplicación (fase 1, ya construidos y funcionando)

`WalkForLife.html`, `WalkForLife-Manual.html`, `WalkForLife-Recetas.html`, `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `LogoWalkforlife.png`.

Estos archivos siguen siendo válidos y funcionales tal cual — la migración a Joomla es un cambio de *dónde y cómo se sirven y protegen*, no necesariamente de *qué son*. Ver `ARCHITECTURE.md` para las opciones concretas de integración.

## Siguiente paso

Leer `CLAUDE.md` y `HANDOFF.md`, y discutir las preguntas abiertas listadas al final de `HANDOFF.md` antes de empezar a instalar o configurar nada.
