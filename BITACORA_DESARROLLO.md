# Bitácora de desarrollo — Digital Garden

Este documento registra el avance real del proyecto y servirá como fuente para elaborar el informe de cierre.

## Sesión 1 — 8 de septiembre de 2026

### Objetivo

Iniciar formalmente el proyecto mediante la creación de la carpeta raíz, la estructura general, la documentación base y el repositorio Git.

### Plan

- Crear la carpeta raíz `digital-garden`.
- Crear la estructura de `client`, `server`, `docs` y `.github`.
- Configurar `README.md`, `.gitignore` y los archivos `.env.example`.
- Inicializar el repositorio local.
- Crear el repositorio remoto en GitHub.
- Realizar el primer commit.

### Avance

- Se creó la carpeta raíz del proyecto.
- Se creó la estructura general del frontend y backend.
- Se prepararon carpetas para pruebas, seguridad, calidad y evidencias.
- Se agregaron archivos `.gitkeep` para conservar las carpetas vacías.
- Se documentó el propósito, alcance, arquitectura y stack del proyecto.
- Se configuró `.gitignore` para proteger secretos y excluir archivos generados.
- Se prepararon plantillas de variables de entorno sin credenciales reales.
- Se configuró el control de versiones y se realizó el primer commit.
- Se creó y vinculó el repositorio remoto de GitHub.

### Problemas encontrados

No se presentaron problemas técnicos durante la creación de la estructura inicial.

### Decisiones

- No instalar todavía las dependencias del frontend o backend.
- Mantener la arquitectura monolítica modular definida.
- Utilizar `.gitkeep` temporalmente para conservar carpetas vacías.
- Proteger las credenciales desde el comienzo mediante `.gitignore`.

### Lecciones aprendidas

Preparar la estructura y el control de versiones antes de programar permite organizar mejor el proyecto, proteger información sensible y conservar un historial claro de su evolución.

### Siguiente paso

Configurar Supabase Cloud y comenzar el diseño del esquema relacional.