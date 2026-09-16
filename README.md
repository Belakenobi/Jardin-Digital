# Digital Garden

Aplicación web full stack para la gestión del conocimiento personal basada en la filosofía de Digital Gardening.

## Descripción

Digital Garden permitirá a personas sin conocimientos de programación crear un espacio personal en Internet donde puedan registrar, desarrollar, relacionar y visualizar sus ideas de forma no lineal.

Las notas evolucionarán mediante tres estados de madurez:

- Semilla 🌱: pensamiento inicial o borrador.
- Brote 🌿: idea en desarrollo.
- Árbol 🌳: idea madura y consolidada.

## Funcionalidades principales del MVP

- Registro, inicio y cierre de sesión.
- Autenticación mediante Supabase Auth y JWT.
- Roles de administrador y usuario.
- Creación y administración de un jardín personal.
- Creación, consulta, edición y eliminación de notas.
- Asignación de estados de madurez.
- Relaciones entre notas y backlinks.
- Visualización de notas mediante un grafo interactivo.
- Galería personal de imágenes.
- Acceso de solo lectura al contenido público.

## Arquitectura

El proyecto utilizará una arquitectura monolítica modular de tres capas:

1. Presentación: React, Vite y Tailwind CSS.
2. Lógica de negocio: Node.js y Express.
3. Datos: PostgreSQL, Auth y Storage mediante Supabase.

El frontend se comunicará con el backend mediante una API REST. El backend centralizará las validaciones, la autenticación, la autorización y las reglas de negocio.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Frontend | React, Vite y Tailwind CSS |
| Backend | Node.js y Express |
| Contenerización | Docker (backend con Node.js 24 Alpine) |
| Base de datos | PostgreSQL en Supabase |
| Autenticación | Supabase Auth y JWT |
| Almacenamiento | Supabase Storage |
| Grafo interactivo | React Flow |
| Pruebas | Jest, Supertest y Postman |
| CI/CD | GitHub Actions |
| Seguridad | OWASP ZAP |
| Calidad | SonarQube |
| Despliegue | Vercel y Render |

## Estructura general

- `client/`: aplicación frontend.
- `server/`: API y lógica de negocio.
- `supabase/migrations/`: esquema SQL versionado de la base de datos.
- `docs/`: evidencias, pruebas, seguridad y calidad.
- `.github/workflows/`: configuración futura del pipeline CI/CD.
- `BITACORA_DESARROLLO.md`: registro del avance real del proyecto.

## Seguridad

Los secretos y credenciales no deben almacenarse en el repositorio. Los archivos `.env` reales serán ignorados por Git y solamente se versionarán plantillas `.env.example` sin valores sensibles.

## Estado actual

Actualizado al 16 de septiembre de 2026.

Módulos completados: **0 — Preparación**, **1 — Base de datos**, **2 — Backend base**, **3 — Autenticación**, **4 — Jardín/perfil** y **5 — Notas**. La integración de sesión en el frontend y las pruebas automatizadas siguen pendientes, como se detalla abajo.

- **Estructura y Git:** documentación base, plantillas de entorno y repositorio configurados.
- **Base de datos:** esquema inicial con perfiles, jardines, notas, relaciones e imágenes; restricciones, triggers, roles y políticas RLS conservados en una migración SQL.
- **Backend base:** Express, CORS, dotenv y conexión con Supabase; endpoints `GET /api/health` y `GET /api/health/database`, respuesta 404 y manejo centralizado de errores.
- **Autenticación:** registro e inicio de sesión mediante Supabase Auth, validación de JWT y autorización por roles. Rutas: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` y `GET /api/auth/admin/check`.
- **Docker:** backend contenerizado con dependencias de producción, usuario sin privilegios y comprobación de salud.
- **Perfil y jardín (Módulo 4 completado):** consulta del perfil y actualización del nombre visible; creación, consulta y actualización del jardín propio (nombre, descripción y visibilidad). Endpoints: `GET /api/profile`, `PATCH /api/profile`, `GET /api/garden`, `POST /api/garden` y `PATCH /api/garden`. Las operaciones utilizan JWT y políticas RLS, se asocian al usuario autenticado y limitan la creación a un jardín por usuario, con respuesta `409 Conflict` al intentar crear un segundo.
- **Notas (Módulo 5 completado):** creación, listado, consulta individual, actualización parcial y eliminación mediante `route -> controller -> service -> Supabase`. Endpoints: `POST /api/notes`, `GET /api/notes`, `GET /api/notes/:id`, `PATCH /api/notes/:id` y `DELETE /api/notes/:id`. Requieren JWT Bearer y operan sobre el jardín del usuario autenticado, con políticas RLS. Admiten madurez `seed`, `budding` y `tree`, y filtro `GET /api/notes?maturity=seed` (también `budding` o `tree`). El listado se ordena por última modificación descendente. PostgreSQL genera `created_at` y actualiza `updated_at` mediante trigger sin alterar la fecha de creación; la API los devuelve como `createdAt` y `updatedAt`.

La API utiliza el puerto `4000` y permite el origen local del futuro frontend en `http://localhost:5173`. Las verificaciones manuales de base de datos, autenticación, Docker, perfil/jardín y notas están registradas en `BITACORA_DESARROLLO.md`. Para notas se reportaron pruebas en Postman de CRUD, madurez, filtros, fechas y respuestas `200`, `201`, `400`, `401` y `404`, con persistencia comprobada en Supabase. No hay pruebas automatizadas del Módulo 5; siguen pendientes para un módulo posterior.

El frontend todavía tiene únicamente su estructura inicial. Quedan pendientes los módulos funcionales de relaciones/backlinks, galería y grafo, además del panel administrativo y la interfaz pública. También falta integrar persistencia, cierre y renovación de sesión, configurar SMTP propio, implementar pruebas automatizadas con cobertura >=80 %, CI/CD, despliegue y análisis de seguridad/calidad. La lista de tecnologías y funcionalidades anterior describe el alcance previsto del MVP.

## Próximo módulo

Implementar el Módulo 6: Relaciones / Backlinks, reutilizando el middleware de autenticación y las políticas RLS existentes. Probar los endpoints antes de avanzar al frontend.
