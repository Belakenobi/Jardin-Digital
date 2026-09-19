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
| Almacenamiento | Supabase Storage (bucket privado) |
| Carga de imágenes | Multer 2.4.0 (multipart/form-data) |
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

Las rutas protegidas validan el JWT con Supabase Auth y usan el cliente del usuario sujeto a RLS. Los servicios de notas, relaciones y galería resuelven el jardín por el usuario autenticado. Consultar o modificar una nota ajena mediante `GET/PATCH /api/notes/:id` devuelve `404`. Este alcance corresponde a la API del jardín propio; las políticas SQL también contemplan lectura pública y permisos administrativos, sin que exista todavía una API de visitante o un panel administrativo.

## Estado actual

Actualizado al 19 de septiembre de 2026.

Módulos completados: **0 — Preparación**, **1 — Base de datos**, **2 — Backend base**, **3 — Autenticación**, **4 — Jardín/perfil**, **5 — Notas**, **6 — Relaciones / Backlinks**, **7 — Galería / Supabase Storage** y **8 — Revisión completa del backend en Postman**. La integración de sesión en el frontend y las pruebas automatizadas siguen pendientes, como se detalla abajo.

- **Estructura y Git:** documentación base, plantillas de entorno y repositorio configurados.
- **Base de datos:** esquema inicial con perfiles, jardines, notas, relaciones e imágenes; restricciones, triggers, roles y políticas RLS conservados en una migración SQL.
- **Backend base:** Express, CORS, dotenv y conexión con Supabase; endpoints `GET /api/health` y `GET /api/health/database`, respuesta 404 y manejo centralizado de errores.
- **Autenticación:** registro e inicio de sesión mediante Supabase Auth, validación de JWT y autorización por roles. Rutas: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` y `GET /api/auth/admin/check`.
- **Docker:** backend contenerizado con dependencias de producción, usuario sin privilegios y comprobación de salud.
- **Perfil y jardín (Módulo 4 completado):** consulta del perfil y actualización del nombre visible; creación, consulta y actualización del jardín propio (nombre, descripción y visibilidad). Endpoints: `GET /api/profile`, `PATCH /api/profile`, `GET /api/garden`, `POST /api/garden` y `PATCH /api/garden`. Las operaciones utilizan JWT y políticas RLS, se asocian al usuario autenticado y limitan la creación a un jardín por usuario, con respuesta `409 Conflict` al intentar crear un segundo.
- **Notas (Módulo 5 completado):** creación, listado, consulta individual, actualización parcial y eliminación mediante `route -> controller -> service -> Supabase`. Endpoints: `POST /api/notes`, `GET /api/notes`, `GET /api/notes/:id`, `PATCH /api/notes/:id` y `DELETE /api/notes/:id`. Requieren JWT Bearer y operan sobre el jardín del usuario autenticado, con políticas RLS. Admiten madurez `seed`, `budding` y `tree`, y filtro `GET /api/notes?maturity=seed` (también `budding` o `tree`). El listado se ordena por última modificación descendente. PostgreSQL genera `created_at` y actualiza `updated_at` mediante trigger sin alterar la fecha de creación; la API los devuelve como `createdAt` y `updatedAt`.

- **Relaciones / Backlinks (Módulo 6 completado):** backend sobre `public.note_relations`, con el flujo `route -> controller -> service -> Supabase`, JWT y RLS. `POST /api/relations` crea una relación dirigida con `{ "sourceNoteId": "...", "targetNoteId": "..." }`; `GET /api/relations/note/:noteId` devuelve `relations.outgoing` (salientes) y `relations.incoming` (backlinks); `DELETE /api/relations/:id` elimina una relación del jardín propio. Se comprueban el jardín, la existencia y pertenencia de ambas notas, las autorrelaciones y los duplicados. SQL mantiene las restricciones de notas distintas, par único, mismo jardín y eliminación en cascada.

- **Galería / Supabase Storage (Módulo 7 completado):** carga, listado, edición de metadatos y eliminación de imágenes con JWT y RLS. Archivos en el bucket privado `gallery` y metadatos en `public.gallery_images`; detalles y configuración abajo.

La API utiliza por defecto el puerto `4000` y el origen CORS `http://localhost:5173`, configurables mediante `PORT` y `CLIENT_URL`. El **Módulo 8 está funcionalmente terminado y probado manualmente**: se verificaron relaciones/backlinks, galería, URLs firmadas, eliminación en Storage y PostgreSQL, aislamiento de notas entre usuarios y rechazo de cargas inválidas. La corrección final reconoce los errores de Multer como `400 Bad Request`. Los resultados reportados del cierre están en `BITACORA_DESARROLLO.md`; se contrastaron con el código y no se repitieron contra Supabase durante esta actualización documental. Las pruebas automatizadas y la cobertura >=80 % siguen pendientes.

El frontend todavía tiene únicamente su estructura inicial. Quedan pendientes frontend React/Vite/Tailwind, grafo React Flow, panel administrativo y visitante básico. También falta integrar persistencia, cierre y renovación de sesión, configurar SMTP propio, implementar pruebas automatizadas con cobertura >=80 %, GitHub Actions (CI/CD), despliegue, OWASP ZAP, SonarQube, evidencias e informe final. La lista de tecnologías y funcionalidades anterior describe el alcance previsto del MVP.

## Galería / Supabase Storage

Todas las rutas requieren `Authorization: Bearer` y un jardín del usuario autenticado. Express recibe los archivos y opera con el cliente Supabase del usuario, sujeto a RLS; el futuro frontend enviará las cargas a la API.

| Método y ruta | Entrada y resultado |
| --- | --- |
| `POST /api/gallery` | `multipart/form-data`: `image` (File obligatorio), `description` y `noteId` (Text opcionales). Devuelve `201`, `{ status, data }`. |
| `GET /api/gallery` | Devuelve `200`, `{ status, images }`, ordenado por creación descendente; cada imagen incluye `imageUrl`. |
| `PATCH /api/gallery/:id` | JSON con `description` y/o `noteId`. Devuelve `200`, `{ status, data }`; solo modifica metadatos; `noteId: null` desasocia la nota. |
| `DELETE /api/gallery/:id` | Borra primero el archivo y después su fila. Devuelve `200` y el mensaje `Gallery image deleted successfully`. |

Multer usa memoria temporal (Buffer), límite de `5 * 1024 * 1024` bytes (5 242 880 bytes, 5 MiB; el mensaje de error lo expresa como 5 MB) y filtro MIME `image/jpeg`, `image/png`, `image/webp`. El campo del archivo se llama exactamente `image`. Una imagen puede asociarse con cero o una nota del mismo jardín. Una nota inexistente o ajena con UUID válido devuelve `400`, `Note not found in your garden`, antes de subir el archivo. PATCH no cambia `storage_path`, `garden_id` ni reemplaza la imagen.

El filtro verifica `file.mimetype`; no inspecciona el contenido binario ni valida por separado la extensión. Los tipos no permitidos, como PDF, reciben `400` con `Only JPG, PNG and WEBP images are allowed`. El manejador `server/src/middleware/error.middleware.js` reconoce `MulterError`: `LIMIT_FILE_SIZE` y `LIMIT_UNEXPECTED_FILE` devuelven `400`, con mensajes de tamaño máximo y uso del campo `image`, respectivamente.

Storage guarda los archivos aceptados; PostgreSQL guarda `id`, `garden_id`, `storage_path`, `description`, `note_id`, `created_at` y `updated_at`. La ruta es `gallery/<USER_UUID>/<IMAGE_UUID>.<extension>`; `storage_path` conserva solo `<USER_UUID>/<IMAGE_UUID>.<extension>`. No existe una FK hacia Storage: `gallery.service.js` mantiene la relación e intenta retirar el archivo si falla la inserción de metadatos.

La eliminación coordina dos operaciones separadas: si falla Storage no se borra la fila; si falla PostgreSQL después del borrado del archivo, puede quedar un registro sin archivo. No hay transacción conjunta.

El bucket es privado. GET genera una URL firmada por imagen con `createSignedUrl(storage_path, 60 * 60)`: dura 3600 segundos (una hora) y puede usarse como `src` de una imagen. Caduca esa URL, no el acceso permanente a la galería; una nueva consulta solicita URLs firmadas nuevamente.

### Configuración para otra instalación

Según el cierre del módulo, se creó manualmente en Supabase Dashboard el bucket **`gallery`**, tipo **PRIVATE**, límite **5 MB** y los tres MIME anteriores. Sobre `storage.objects` se configuraron tres políticas para el rol `authenticated`: INSERT, SELECT y DELETE, restringidas mediante:

```sql
bucket_id = 'gallery'
AND (storage.foldername(name))[1] = auth.uid()::text
```

Aplicar la condición como `WITH CHECK` para INSERT y `USING` para SELECT y DELETE. No se requiere UPDATE de archivos físicos en este MVP. **El repositorio no contiene una migración que cree el bucket ni estas políticas de Storage**: deben configurarse manualmente en otra instalación. La migración inicial sí incluye la tabla `gallery_images` y sus políticas de PostgreSQL. Nunca documentar credenciales ni URLs firmadas reales.

## Próximo módulo

Continuar con el **Módulo 9 — Frontend** (React/Vite/Tailwind), sobre el backend verificado en el Módulo 8.
