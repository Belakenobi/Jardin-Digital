# Evidencia de contenerización del backend

## Objetivo

Empaquetar el backend de Digital Garden en un contenedor Docker reproducible, aislado y preparado para entornos de prueba o despliegue.

## Implementación

Se creó un `Dockerfile` basado en Node.js 24 Alpine y un archivo `.dockerignore` para evitar incorporar dependencias locales, archivos innecesarios y variables privadas dentro de la imagen.

La imagen instala únicamente dependencias de producción, ejecuta el proceso con un usuario sin privilegios administrativos y contiene una comprobación automática de salud.

## Construcción

```bash
docker build -t digital-garden-api:dev ./server
