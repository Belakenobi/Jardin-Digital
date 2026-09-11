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

## 09/09/2026 — Módulo 1: Base de datos en Supabase

### Objetivo
Crear y asegurar el modelo relacional inicial de Digital Garden en una base de datos PostgreSQL alojada en Supabase.

### Planeado
Configurar el proyecto cloud, crear las tablas del MVP, definir relaciones, restricciones, roles, RLS y datos de prueba.

### Logrado
Se creó el proyecto de Supabase y las tablas `profiles`, `gardens`, `notes`, `note_relations` y `gallery_images`. Se configuraron llaves primarias y foráneas, restricciones, índices, eliminación en cascada, actualización automática de fechas y creación automática de perfiles. También se implementaron permisos y políticas RLS para visitantes, usuarios autenticados, propietarios y administradores.

Se probaron registros válidos e inválidos, relaciones duplicadas, autorrelaciones, aislamiento entre jardines, backlinks, eliminación en cascada, visibilidad pública y privada, y acceso según roles. Finalmente, se creó una migración SQL con el esquema reproducible.

### Problemas encontrados
Se ejecutó accidentalmente dos veces un trigger, lo que produjo un error porque ya existía. También aparecieron errores durante las pruebas de restricciones, pero estos eran resultados esperados que confirmaron el correcto funcionamiento de la base de datos.

### Decisiones
Se utilizó UUID para los identificadores, un jardín por usuario, visibilidad a nivel de jardín y PostgreSQL para manejar las relaciones y backlinks. Las imágenes se almacenarán posteriormente en Supabase Storage, mientras que PostgreSQL conservará únicamente sus metadatos.

### Aprendizajes
Comprendí la diferencia entre Supabase y MySQL Workbench, así como el funcionamiento de llaves, restricciones, triggers, cascadas, roles y seguridad a nivel de fila. También aprendí que los cambios realizados en el dashboard deben conservarse mediante archivos SQL versionados en Git.


## 10 de septiembre de 2026 — Módulo 2: Backend base

### Objetivo
Configurar la base del backend de Digital Garden y comprobar su comunicación con Supabase.

### Trabajo realizado
- Se inicializó el proyecto de Node.js dentro de `server`.
- Se instalaron Express, CORS, dotenv, Supabase JS y nodemon.
- Se configuraron las variables de entorno.
- Se estableció el puerto 4000 para evitar conflictos con otra aplicación local.
- Se creó la aplicación base de Express.
- Se configuró CORS para el futuro frontend.
- Se creó el endpoint `/api/health`.
- Se creó el conector de Supabase.
- Se creó el endpoint `/api/health/database`.
- Se agregó una respuesta 404 para rutas inexistentes.

### Resultado
El servidor responde correctamente, se conecta con Supabase y maneja rutas inexistentes.

### Decisiones
Se utilizaron las nuevas llaves Publishable de Supabase en lugar de las llaves legacy `anon`.

### Aprendizaje
Comprendí la función de Node.js, Express, las variables de entorno, CORS y la conexión entre el backend y Supabase.


## 11 de septiembre de 2026 — Dockerización del backend

Se creó y probó una imagen Docker del backend Express. El contenedor utilizó Node.js 24, dependencias de producción, ejecución sin privilegios administrativos y una comprobación automática de salud. La API y la conexión con Supabase funcionaron correctamente desde el contenedor.
