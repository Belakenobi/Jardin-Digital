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

## 11 de septiembre de 2026 — Módulo 3: Autenticación y autorización

### Objetivo
Implementar el registro e inicio de sesión de usuarios mediante Supabase Auth, proteger rutas con JWT y establecer autorización basada en los roles `user` y `admin`.

### Trabajo realizado
- Se creó la estructura modular de rutas, controladores, servicios, validadores y middleware.
- Se implementó el registro mediante email y contraseña.
- Se validaron el nombre, correo y contraseña antes de enviar los datos a Supabase.
- Se conectó el registro con el trigger de creación automática de perfiles.
- Se implementó el inicio de sesión mediante Supabase Auth.
- Se devolvieron el access token y refresh token necesarios para administrar la sesión.
- Se creó un middleware que obtiene el JWT del encabezado `Authorization`.
- Se validó el JWT mediante Supabase Auth.
- Se consultó el perfil del usuario autenticado para recuperar su nombre y rol.
- Se creó middleware de autorización para restringir rutas según el rol.
- Se implementaron las rutas protegidas `/api/auth/me` y `/api/auth/admin/check`.
- Se configuró a la creadora del proyecto con el rol `admin`.
- Se agregó manejo centralizado de errores.
- Se desactivó el encabezado `X-Powered-By` para evitar revelar Express.
- Se configuró una clave secreta exclusivamente en el backend y se comprobó que `.env` permanece fuera de Git y Docker.

### Pruebas realizadas
- Registro con datos inválidos.
- Registro válido con respuesta `201 Created`.
- Creación automática del perfil con el mismo UUID de `auth.users`.
- Login con datos inválidos.
- Login con contraseña incorrecta.
- Login exitoso y generación de tokens.
- Acceso sin JWT con respuesta `401 Unauthorized`.
- Acceso con JWT falso con respuesta `401 Unauthorized`.
- Acceso con JWT válido a una ruta protegida.
- Intento de un usuario normal de acceder a una ruta administrativa con respuesta `403 Forbidden`.
- Acceso exitoso con rol `admin`.
- Construcción y ejecución del backend actualizado dentro de Docker.
- Verificación de que `.env` no está incluido en la imagen Docker.
- Revisión de permisos PostgreSQL para impedir que un usuario modifique su propio rol.

### Problemas encontrados
El enlace inicial de confirmación redirigía al puerto 3000 y había expirado. Se corrigió la Site URL de Supabase para utilizar el puerto 5173 del futuro frontend. El servicio SMTP integrado también presentó limitaciones de envío, por lo que la cuenta de desarrollo se confirmó mediante una operación administrativa segura desde el backend.

Durante una prueba se utilizó accidentalmente sintaxis de Fish dentro de Zsh. El problema se corrigió utilizando sustitución de comandos compatible con Zsh.

### Decisiones
- Utilizar la clave publicable para registro, login y operaciones sujetas a RLS.
- Reservar la clave secreta exclusivamente para operaciones administrativas del backend.
- Crear clientes independientes de Supabase para evitar compartir sesiones entre peticiones.
- Consultar el rol desde `profiles` después de validar el JWT.
- Mantener el backend sin estado; la persistencia visual y eliminación local de la sesión se integrarán posteriormente con el frontend.
- Configurar un servicio SMTP propio antes del despliegue final.

### Aprendizajes
Comprendí la diferencia entre autenticación y autorización, la función de un JWT, el uso del encabezado `Authorization: Bearer`, la diferencia entre respuestas 401 y 403, y la importancia de aplicar mínimo privilegio a las claves y permisos de la base de datos.

### Resultado
El backend permite registrar usuarios, iniciar sesión, validar JWT, recuperar la identidad y el rol, y proteger recursos según los permisos del usuario. La funcionalidad también fue comprobada correctamente dentro de Docker.


## 15 de septiembre de 2026 — Módulo 4: Perfil y Jardín

### Estado
Completado.

### Objetivo
Implementar la administración básica del perfil y del jardín personal del usuario autenticado.

### Perfil
- Consulta del perfil del usuario autenticado.
- Actualización del nombre visible.
- Acceso protegido mediante JWT.
- Operaciones realizadas respetando las políticas RLS de Supabase.

Endpoints implementados:
- `GET /api/profile`
- `PATCH /api/profile`

### Jardín
- Creación del jardín personal.
- Consulta del jardín propio.
- Actualización de nombre, descripción y visibilidad.
- Restricción de un jardín por usuario.
- Asociación automática de las operaciones con el usuario autenticado.
- Protección mediante JWT y políticas RLS.

Endpoints implementados:
- `GET /api/garden`
- `POST /api/garden`
- `PATCH /api/garden`

### Validaciones realizadas
Validaciones reportadas al cerrar el módulo; no se volvieron a ejecutar durante esta actualización documental.

- Consulta y modificación correcta del perfil.
- Creación correcta del jardín.
- Consulta del jardín creado.
- Actualización de nombre, descripción y visibilidad.
- Bloqueo de un segundo jardín para el mismo usuario mediante respuesta `409 Conflict`.
- Verificación de acceso autenticado mediante JWT.


## 16 de septiembre de 2026 — Módulo 5: Notas

### Estado
Completado.

### Objetivo
Implementar la creación, consulta, actualización y eliminación de notas del jardín del usuario autenticado, con estados de madurez, filtros y fechas automáticas.

### Trabajo realizado
- Se implementó el flujo `route -> controller -> service -> Supabase` en `note.routes.js`, `note.controller.js` y `note.service.js`, y se registraron las rutas en `server/src/app.js`.
- Se agregó creación, listado, consulta individual por ID, actualización parcial y eliminación de notas.
- Se validan título no vacío, contenido de tipo texto y madurez `seed`, `budding` o `tree`. Al crear, el contenido predeterminado es vacío y la madurez es `seed`.
- El listado permite filtrar con `?maturity=seed`, `?maturity=budding` o `?maturity=tree`, y ordena las notas por última modificación, de más reciente a más antigua.
- PostgreSQL genera `created_at` y `updated_at` al insertar; el trigger de actualización modifica `updated_at` sin cambiar `created_at`. La API devuelve estos campos como `createdAt` y `updatedAt`.
- Todos los endpoints requieren JWT mediante `Authorization: Bearer`. El servicio obtiene el jardín a partir del usuario autenticado y utiliza el cliente Supabase asociado a su token, respetando RLS. Antes de actualizar o eliminar se consulta la nota dentro de ese jardín.

Endpoints implementados:
- `POST /api/notes`
- `GET /api/notes`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`

### Validaciones realizadas
Pruebas manuales en Postman y Supabase reportadas al cerrar el módulo; no se volvieron a ejecutar durante esta actualización documental.

- Creación, listado, consulta individual, actualización y eliminación de notas.
- Asignación de los tres estados de madurez y filtrado por madurez.
- Generación automática de fechas y cambio de `updated_at` al editar, conservando `created_at`.
- Acceso mediante Bearer Token y operaciones sobre el jardín del usuario autenticado.
- Respuestas principales `200`, `201`, `400`, `401` y `404`; el código devuelve `201` al crear y `200` al consultar, actualizar o eliminar.
- Persistencia de los cambios comprobada directamente en Supabase.

Las pruebas unitarias y automatizadas siguen pendientes para un módulo posterior; estas verificaciones manuales no constituyen un reporte de cobertura.

### Aprendizajes
La asociación de las notas al jardín debe resolverse desde la identidad autenticada. La separación por capas permite mantener las validaciones en el controlador y las consultas en el servicio; los valores predeterminados y triggers de PostgreSQL administran las fechas sin recibirlas del cliente.

### Resultado
Módulo 5 completado: CRUD de notas, madurez, filtros y fechas automáticas implementados en el backend, con verificación manual y persistencia reportadas en Supabase.


## 17 de septiembre de 2026 — Módulo 6: Relaciones / Backlinks

### Estado
Completado.

### Objetivo
Implementar relaciones dirigidas entre notas del jardín del usuario autenticado y consultar sus enlaces salientes y backlinks.

### Trabajo realizado
- Se reutilizó la tabla existente `public.note_relations`, siguiendo el flujo `route -> controller -> service -> Supabase`.
- Se crearon `server/src/routes/relation.routes.js`, `server/src/controllers/relation.controller.js` y `server/src/services/relation.service.js`.
- Se modificó `server/src/app.js` para registrar la ruta principal `/api/relations`.
- Los endpoints utilizan el middleware de autenticación JWT y el cliente Supabase del usuario, sujeto a RLS.
- El controlador exige identificadores de origen y destino de tipo texto no vacío. El servicio comprueba que exista el jardín, que existan ambas notas dentro del jardín del usuario, que sean distintas y que no exista ya el mismo par dirigido.
- La migración existente conserva `source_note_id != target_note_id`, `UNIQUE(source_note_id, target_note_id)`, claves foráneas compuestas para el mismo `garden_id` y eliminación en cascada. No se modificó el esquema SQL.

Endpoints implementados:
- `POST /api/relations`: crea una relación dirigida con `{ "sourceNoteId": "...", "targetNoteId": "..." }`.
- `GET /api/relations/note/:noteId`: devuelve `relations.outgoing` (relaciones salientes) y `relations.incoming` (relaciones entrantes o backlinks).
- `DELETE /api/relations/:id`: elimina una relación existente del jardín del usuario autenticado.

### Pruebas realizadas
Pruebas manuales en Postman y comprobaciones visuales en Supabase reportadas por la estudiante al cerrar el módulo; no se volvieron a ejecutar durante esta actualización documental. Las validaciones descritas arriba también se contrastaron con el código, sin atribuirles pruebas manuales adicionales.

1. `GET /api/notes`: `200 OK`; permitió obtener los UUID reales de las notas.
2. `POST /api/relations` con dos notas válidas: `201 Created`; la relación apareció en `public.note_relations` en Supabase.
3. Repetir exactamente la misma relación: `409 Conflict`, con `{ "status": "error", "message": "Relation already exists" }`.
4. Relacionar una nota consigo misma: `400 Bad Request`, con `{ "status": "error", "message": "A note cannot be related to itself" }`.
5. Consultar la nota origen mediante `GET /api/relations/note/:noteId`: `200 OK`; la relación apareció en `outgoing`.
6. Consultar la nota destino mediante el mismo endpoint: `200 OK`; la relación apareció en `incoming`, confirmando el backlink.
7. `DELETE /api/relations/:id`: `200 OK`, con el mensaje `"Relation deleted successfully"`.
8. Consultar nuevamente ambas notas: en ambas, el objeto `relations` quedó como `{ "outgoing": [], "incoming": [] }`. También se verificó visualmente que `note_relations` quedó vacía en Supabase.

Las pruebas automatizadas y la cobertura >= 80 % siguen pendientes; estas comprobaciones manuales no constituyen un reporte de cobertura.

### Problemas encontrados
En la primera prueba de creación se recibió `500 Internal Server Error`. La terminal mostró `invalid input syntax for type uuid`, con código PostgreSQL `22P02`. Se identificó que `sourceNoteId` se había copiado incorrectamente y contenía un UUID incompleto. Al utilizar los UUID reales obtenidos de `GET /api/notes`, la creación respondió `201 Created`.

Se registra como error de prueba/dato de entrada, no como fallo de la implementación final del módulo. El backend todavía no valida el formato UUID: como mejora futura, conviene rechazarlo con `400 Bad Request` antes de consultar PostgreSQL, evitando que ese dato inválido termine como `500`. Esta mejora no se implementó en este cierre documental.

### Decisiones
- Reutilizar `note_relations` y sus restricciones existentes sin cambiar la migración.
- Mantener la arquitectura por capas y resolver el jardín desde el usuario autenticado.
- Representar el backlink consultando las relaciones entrantes; no crear automáticamente una segunda relación inversa.
- Conservar el contexto maestro como archivo local excluido de Git.
- Continuar con galería/Storage; mantener pendientes la revisión completa en Postman, el frontend, React Flow, admin/visitante básico, testing, GitHub Actions, deploy, OWASP ZAP, SonarQube, evidencias e informe final.

### Aprendizajes
Una relación dirigida aparece como salida de la nota origen y como backlink de la nota destino. Revisar el mensaje y el código de error en terminal ayuda a distinguir un dato mal copiado de un problema en el flujo funcional. Las validaciones del backend y las restricciones de PostgreSQL se complementan para mantener la integridad.

### Resultado
Módulo 6 completado: creación, consulta de relaciones/backlinks y eliminación implementadas, con resultados manuales reportados en Postman y Supabase. Módulos 0, 1, 2, 3, 4, 5 y 6 completados dentro de su alcance de backend y preparación.

### Siguiente paso
Módulo 7 — Galería / Supabase Storage.


## 17–18 de septiembre de 2026 — Módulo 7: Galería / Supabase Storage

### Estado
Completado a nivel backend y pruebas manuales en Postman.

### Objetivo
Implementar la galería visual con archivos reales en Supabase Storage, metadatos en PostgreSQL y Express como intermediario, usando JWT y RLS.

### Trabajo realizado
- Se creó manualmente el bucket `gallery` en Supabase Dashboard: PRIVATE, máximo 5 MB y MIME `image/jpeg`, `image/png`, `image/webp`.
- Se configuraron exactamente tres políticas sobre `storage.objects` para `authenticated`: INSERT, SELECT y DELETE, con `bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text`. Cada persona opera solo en su carpeta. No se agregó UPDATE porque no se reemplazan archivos físicos. No existe una migración que reproduzca esta configuración de Storage.
- Se agregó Multer 2.4.0, registrado en `server/package.json` y `server/package-lock.json`. El nuevo `server/src/middleware/upload.middleware.js` exporta `uploadGalleryImage`, con `memoryStorage()`, Buffer temporal, límite `5 * 1024 * 1024` bytes y filtro de los tres MIME permitidos.
- Se crearon `server/src/routes/gallery.routes.js`, `server/src/controllers/gallery.controller.js` y `server/src/services/gallery.service.js`; `server/src/app.js` registra `app.use("/api/gallery", galleryRoutes)`. Flujo: route -> middleware -> controller -> service -> Supabase PostgreSQL / Storage.
- La tabla existente `public.gallery_images` guarda `id`, `garden_id`, `storage_path`, `description` nullable, `note_id` nullable, `created_at` y `updated_at`. `storage_path` contiene `<USER_UUID>/<IMAGE_UUID>.<extension>`, sin `gallery/`; la relación con Storage la mantiene el servicio, sin FK ni sincronización automática.

Endpoints implementados:
- `POST /api/gallery` recibe multipart/form-data mediante `uploadGalleryImage.single("image")`: archivo `image` obligatorio, `description` y `noteId` opcionales. Comprueba jardín y pertenencia de la nota antes de subir; genera un nombre con `randomUUID()`, sube el Buffer e inserta metadatos. Si falla la inserción, intenta borrar el objeto recién subido.
- `GET /api/gallery` devuelve metadatos e `imageUrl` mediante `createSignedUrl(storage_path, 60 * 60)`. La URL dura una hora; otra consulta solicita nuevas URLs, sin limitar a una hora el uso de la galería.
- `PATCH /api/gallery/:id` modifica únicamente `description` y/o `noteId`, validando que la nota pertenezca al jardín. `DELETE /api/gallery/:id` busca la imagen del jardín autenticado, borra el objeto y después la fila.

### Pruebas realizadas
Pruebas manuales reportadas por la estudiante al cerrar el módulo; no se repitieron contra Supabase durante esta actualización documental.

- GET: `200 OK`; POST: `201 Created`; PATCH y DELETE: `200 OK`.
- Carga independiente con `note_id = NULL` y carga asociada a una nota real; archivos visibles en `gallery` y filas en `public.gallery_images`.
- URL firmada abierta en navegador, con imagen visible.
- PATCH: cambia `description` y `updatedAt`, conserva `storagePath` y `createdAt`.
- DELETE: mensaje `Gallery image deleted successfully`; desaparición comprobada tanto en Storage como en PostgreSQL.
- POST con UUID válido de nota inexistente: tras la corrección, `400 Bad Request` y `{ "status": "error", "message": "Note not found in your garden" }`. La validación ocurre antes de guardar archivos o metadatos.
- `node --check` sin errores en `src/middleware/upload.middleware.js`, `src/routes/gallery.routes.js`, `src/controllers/gallery.controller.js`, `src/services/gallery.service.js`, `src/middleware/error.middleware.js` y `src/app.js`, desde `server/`. Un intento buscó accidentalmente `error.middleware.jsq` por un typo en terminal; se repitió correctamente. No fue un fallo del código. Estas seis comprobaciones de sintaxis también se repitieron al actualizar la documentación.

### Problemas encontrados
Al configurar DELETE, Dashboard exigió también SELECT y generó una política SELECT duplicada. Se eliminó manualmente la adicional; quedaron solo INSERT, SELECT y DELETE.

Un `noteId` con UUID válido pero inexistente produjo inicialmente `500`: el servicio asignaba `error.statusCode = 400`, pero el manejador consultaba solo `error.status`. Se corrigió `server/src/middleware/error.middleware.js` con `error.statusCode ?? error.status`. Los códigos enteros 4xx conservan su mensaje y estado; los errores inesperados siguen como `500` con `Unexpected server error`. La mejora es transversal al backend y facilita la integración del frontend y las pruebas posteriores.

### Decisiones
- Mantener el bucket privado, con carpetas por USER_UUID y URLs firmadas de una hora.
- Admitir JPG/PNG/WEBP y máximo 5 MB.
- Asociar cada imagen con cero o una nota; PATCH solo modifica metadatos.
- Mantener Express como intermediario para las cargas del futuro frontend React.
- Tratar Storage y PostgreSQL como operaciones separadas, sin transacción conjunta; la limpieza tras un fallo de inserción es un intento, no una garantía de atomicidad.

### Aprendizajes
Storage conserva archivos y PostgreSQL sus metadatos; `storage_path` conecta ambos a nivel de aplicación. Las políticas del bucket son distintas de las de la tabla. Una URL firmada caduca y puede solicitarse otra. Unificar `statusCode` y `status` evita convertir errores de negocio en respuestas 500.

### Resultado
Módulos 0–7 completados dentro de su alcance de preparación y backend. Galería implementada y validada manualmente; pruebas automatizadas Jest/Supertest y cobertura >=80 % aún pendientes.

### Siguiente paso
Módulo 8 — Revisión completa del backend en Postman; después Módulo 9 — Frontend. Siguen pendientes React/Vite/Tailwind funcional, React Flow, admin/visitante básico, testing, CI/CD, deploy, OWASP ZAP, SonarQube, evidencias e informe final.
