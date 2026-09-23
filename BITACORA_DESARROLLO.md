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


## 19 de septiembre de 2026 — Módulo 8: Revisión completa del backend en Postman

### Estado
Completado funcionalmente y probado manualmente. Pendiente de revisión documental y versionado por la estudiante.

### Objetivo
Cerrar la revisión del backend existente, comprobar relaciones, galería y aislamiento entre usuarios, y registrar la corrección final del manejo de errores de carga.

### Trabajo realizado
Se contrastó el estado actual de `server/src/app.js`, las rutas, controladores y servicios de notas, relaciones y galería, los middleware de autenticación, carga y errores, y `supabase/migrations/20260910000000_initial_schema.sql`. Las funcionalidades de relaciones y galería se implementaron en los módulos 6 y 7; este módulo consolida su verificación y cierre.

- Relaciones: `server/src/routes/relation.routes.js`, `server/src/controllers/relation.controller.js` y `server/src/services/relation.service.js` operan sobre `public.note_relations`. `POST /api/relations` recibe `sourceNoteId` y `targetNoteId`, comprueba ambas notas dentro del jardín propio, rechaza autorrelaciones con `400` y pares dirigidos ya existentes con `409`. SQL refuerza la integridad mediante CHECK, UNIQUE y FK compuestas del mismo jardín.
- `GET /api/relations/note/:noteId` devuelve `relations.outgoing` e `incoming`; los backlinks son relaciones entrantes, sin insertar una relación inversa. `DELETE /api/relations/:id` verifica pertenencia al jardín y elimina la relación.
- Galería: `server/src/routes/gallery.routes.js`, `server/src/controllers/gallery.controller.js` y `server/src/services/gallery.service.js` conectan `public.gallery_images` con el bucket `gallery`. `POST /api/gallery` recibe multipart/form-data con `image` obligatorio y `description`/`noteId` opcionales. La nota se valida antes de subir y debe pertenecer al jardín propio.
- El archivo se guarda como `<USER_UUID>/<IMAGE_UUID>.<extension>` dentro de `gallery`; `storage_path` no incluye el bucket. Si falla la inserción de metadatos, el servicio intenta retirar el archivo recién subido.
- `GET /api/gallery` lista por creación descendente y agrega `imageUrl` con `createSignedUrl(storage_path, 60 * 60)`. Las URLs firmadas duran una hora y permiten visualizar imágenes privadas; una nueva consulta solicita URLs nuevamente. POST y PATCH devuelven metadatos sin `imageUrl`.
- `PATCH /api/gallery/:id` actualiza descripción y/o asociación. `noteId: null` desasocia; omitirlo conserva la asociación. Una nota inexistente o ajena con UUID válido produce `400`, `Note not found in your garden`.
- `DELETE /api/gallery/:id` busca la imagen del jardín propio, elimina el objeto de Storage y después el registro de `gallery_images`. Si falla Storage, no intenta borrar la fila. No hay transacción conjunta: un fallo posterior de PostgreSQL puede dejar metadatos sin archivo.
- `server/src/middleware/upload.middleware.js` usa `memoryStorage()` y `single("image")` se aplica en la ruta. Admite los MIME `image/jpeg`, `image/png` y `image/webp`. El límite real es `5 * 1024 * 1024` = 5 242 880 bytes (5 MiB; mensaje de error: 5 MB). El filtro revisa el MIME declarado, sin inspección binaria ni validación independiente de la extensión.
- Seguridad: las rutas requieren `authenticate`, validan el JWT y usan `request.supabase` con el token del usuario. Los servicios obtienen el jardín mediante `gardens.user_id` y comprueban las notas por `id` y `garden_id`; actualizar una nota exige consultar primero su pertenencia. Consultar o modificar una nota ajena mediante la API devuelve `404`. RLS complementa estas comprobaciones; las políticas SQL también prevén lectura pública y administración, mientras estas rutas operan sobre el jardín propio.

### Problemas encontrados y corrección final
Un campo multipart incorrecto (`iamge` en lugar de `image`) se trataba como error inesperado y terminaba en `500 Internal Server Error`. La corrección ya presente en `server/src/middleware/error.middleware.js` reconoce `error.name === "MulterError"` antes de evaluar `statusCode`/`status` y devuelve `400 Bad Request` con `{ status: "error", message }`:

- `LIMIT_FILE_SIZE`: `Image file must be 5 MB or less`.
- `LIMIT_UNEXPECTED_FILE`: `Unexpected file field. Use "image" as the file field name`.
- Otros errores de Multer conservan `error.message` con estado `400`.

El rechazo de PDF procede del filtro MIME: asigna `statusCode = 400` y el mensaje `Only JPG, PNG and WEBP images are allowed`. Se conserva el manejo general de códigos enteros 4xx mediante `error.statusCode ?? error.status`; los errores inesperados siguen en `500` con `Unexpected server error`.

### Pruebas realizadas
Pruebas manuales de cierre verificadas y reportadas por la estudiante. Se contrastaron rutas y comportamiento con el código local; no se ejecutaron nuevamente peticiones a Supabase durante esta actualización documental.

| Caso | Resultado reportado |
| --- | --- |
| Crear relación válida: `POST /api/relations` | `201` |
| Consultar origen y destino: `GET /api/relations/note/:noteId` | `200`; relación en outgoing/incoming |
| Repetir la relación | `409` |
| Relacionar una nota consigo misma | `400` |
| Eliminar relación: `DELETE /api/relations/:id` | `200` |
| Consultar después de eliminar | Arrays outgoing/incoming vacíos |
| Listar galería: `GET /api/gallery` | `200` |
| Subir JPG válido: `POST /api/gallery` | `201`; archivo presente en Supabase Storage |
| Consultar galería y abrir URL firmada | Imagen visible mediante URL funcional |
| Actualizar descripción: `PATCH /api/gallery/:id` | `200` |
| Asociar imagen con nota válida mediante PATCH | `200` |
| Desasociar con `noteId: null` mediante PATCH | `200` |
| Asociar con nota inexistente/ajena | `400` |
| Eliminar imagen: `DELETE /api/gallery/:id` | `200`; eliminación comprobada del registro y del archivo |
| Otro usuario consulta una nota ajena: `GET /api/notes/:id` | `404` |
| Otro usuario modifica una nota ajena: `PATCH /api/notes/:id` | `404` |
| Enviar campo de archivo `iamge` en lugar de `image` | `400`; mensaje indica el campo correcto |
| Intentar subir PDF | `400`; mensaje indica que solo JPG, PNG y WEBP están permitidos |

El límite de tamaño y el manejo de `LIMIT_FILE_SIZE` se verificaron en código; no se reportó una prueba manual de archivo sobredimensionado. No se atribuyen pruebas automatizadas ni cobertura a estas comprobaciones: `server/tests/` conserva solo `.gitkeep` y `server/package.json` no define script de pruebas ni dependencias Jest/Supertest.

### Decisiones y límites vigentes
- Conservar el bucket privado y las políticas manuales de Storage registradas en el Módulo 7. No hay migración del bucket/políticas de Storage y no se consultó el Dashboard durante esta revisión documental.
- Mantener el alcance real de las validaciones: sigue pendiente validar formato UUID; un UUID mal formado puede terminar en `500`. La comprobación previa de duplicados devuelve `409`, pero el error UNIQUE de una inserción concurrente no tiene un mapeo específico a `409`.
- Conservar el historial de módulos anteriores. Se corrigió el estado desactualizado que dejaba el Módulo 8 pendiente y la afirmación del contexto maestro que negaba el manejo específico de Multer.
- En esta actualización solo se modificaron README, bitácora y contexto maestro local. La corrección funcional del middleware ya existía en staging; no se modificó código, migraciones ni configuración, ni se ejecutó git add, commit o push.

### Aprendizajes
Los errores de un middleware de carga requieren clasificación explícita para devolver respuestas comprensibles al cliente. La comprobación funcional de una eliminación de galería debe incluir tanto Storage como PostgreSQL. Las pruebas con otra identidad permiten verificar el aislamiento aplicado por la API.

### Resultado
Módulos 0–8 completados dentro de su alcance de preparación, backend y revisión manual. Módulo 8 cerrado funcionalmente y probado; cambios documentales listos para revisión antes del commit final.

### Siguiente paso
Módulo 9 — Frontend React/Vite/Tailwind. Siguen pendientes integración de sesión, React Flow, admin/visitante básico, SMTP propio, pruebas automatizadas y cobertura >=80 %, CI/CD, despliegue, OWASP ZAP, SonarQube, evidencias e informe final.


## 20–21 de septiembre de 2026 — Módulo 9: Frontend

### Estado
Implementado. Validación funcional integral en navegador pendiente de registrar.

### Objetivo
Integrar el frontend React con los módulos existentes del backend y permitir administrar el jardín desde una interfaz web.

### Trabajo realizado
- Se configuró el cliente con React 19, Vite 8, Tailwind CSS 4 y React Router.
- Se implementaron registro, login y rutas protegidas mediante `ProtectedRoute`, con consulta de identidad a `/api/auth/me`.
- Se creó `AppLayout` con navegación adaptable y cierre de sesión local.
- Se integró el dashboard con resumen del jardín, conteos por madurez, imágenes y notas recientes.
- Se implementaron edición del perfil, creación inicial del jardín y actualización de nombre, descripción y visibilidad.
- Se conectaron el CRUD de notas y filtro por madurez, las relaciones salientes/backlinks y la galería con carga, edición y eliminación.
- Se separaron páginas, componentes y servicios HTTP; se agregó `ConfirmDialog` para confirmar eliminaciones, junto con estados de carga y mensajes.
- Se persistió la sesión en `localStorage` mediante `dg_session`. El cliente envía Bearer Token, maneja JSON/FormData y solicita renovación ante un `401`, compartiendo la renovación entre solicitudes concurrentes y reintentando una vez.
- Se agregó `POST /api/auth/refresh`, que recibe `refreshToken` y renueva la sesión mediante Supabase Auth. Si la renovación falla o continúa el `401`, el cliente limpia la sesión y redirige al login.

### Validaciones realizadas
El contexto maestro registra `npm run build` y `npm run lint` correctos el 21 de septiembre. La revisión documental actual contrastó las rutas, servicios y páginas; las comprobaciones del frontend actual se registran en el Módulo 10.

No se atribuyen nuevas pruebas manuales en navegador o Supabase. Queda pendiente registrar el recorrido funcional completo, incluida la renovación de sesión y la creación inicial del jardín.

### Decisiones
- Consumir Express mediante `VITE_API_URL`; no utilizar directamente Supabase desde el frontend.
- Conservar una estructura modular y reutilizar el cliente HTTP para todas las páginas.
- Cerrar sesión localmente, sin revocación remota ni renovación preventiva por temporizador.

### Aprendizajes
Separar servicios y páginas facilita reutilizar la autenticación y el manejo de errores. La interfaz debe contemplar tanto un jardín con datos como una cuenta que todavía no ha creado su jardín.

### Resultado
Frontend integrado con los módulos del backend. Compilación y lint registrados; pruebas automatizadas y cobertura >=80 % pendientes.

### Siguiente paso
Módulo 10 — Grafo interactivo con React Flow.


## 22 de septiembre de 2026 — Módulo 10: Grafo interactivo e imágenes asociadas

### Estado
Implementado en el código local. Compilación y lint correctos; validación funcional integral en navegador pendiente de registrar.

### Objetivo
Representar visualmente las notas, sus relaciones y las imágenes asociadas, permitiendo explorar conexiones y abrir el contenido de una nota desde el grafo.

### Trabajo realizado
- Se instalaron `@xyflow/react` (React Flow) y `d3-force`, y se creó `client/src/pages/GraphPage.jsx`.
- Se agregó la ruta protegida `/graph` y el acceso desde la navegación de `AppLayout`.
- Se reutilizan `GET /api/notes`, `GET /api/gallery` y `GET /api/relations/note/:noteId`. Se consultan las relaciones de cada nota y se toman las salientes para construir las aristas dirigidas, sin duplicarlas por sus backlinks.
- Se representa cada nota con su título, emoji y color según madurez: semilla, brote o árbol. Las relaciones entre notas se muestran con flechas verdes.
- Se distribuyen las notas mediante una simulación de fuerzas con atracción entre notas relacionadas, repulsión, centrado y prevención de solapamientos. La distribución se calcula al cargar el grafo.
- Se incorporaron desplazamiento, zoom, controles, ajuste inicial de la vista y arrastre de nodos.
- Al seleccionar una nota, se resaltan sus conexiones entrantes/salientes y sus imágenes; los demás elementos se atenúan. El panel muestra madurez, número de conexiones, backlinks, enlaces salientes y una vista previa de hasta 250 caracteres de contenido, con puntos suspensivos si se recorta.
- El enlace `Abrir nota completa` navega a `/notes?selected=<id>`. `NotesPage` identifica la tarjeta, la resalta y desplaza la vista hacia ella; allí se muestra el contenido completo.
- Se agregaron nodos circulares amarillos para imágenes con `noteId`, distribuidos alrededor de la nota asociada y unidos mediante líneas amarillas discontinuas. Las imágenes independientes permanecen en la galería y no aparecen como nodos del grafo.
- El panel de la nota permite seleccionar miniaturas de sus imágenes. Al seleccionar una imagen, se resaltan su nodo, su enlace y su nota; el panel muestra imagen, descripción, nota asociada, fecha y acceso a `/gallery`.
- Se utilizan las URLs firmadas devueltas por la galería. Se agregó `.image-node` en `index.css` para ocultar los puntos de conexión de estos nodos.
- Un clic en el fondo limpia la selección y restablece el aspecto general. Se contemplan estados de carga, error y jardín sin notas.

### Validaciones realizadas
Revisión del commit `0e94b8d` y de los cambios locales existentes en `GraphPage.jsx` e `index.css`. La integración inicial del grafo y la navegación a notas están versionadas; la ampliación visual con imágenes forma parte de los cambios locales revisados.

- `npm run build` en `client/`: correcto, 225 módulos transformados.
- `npm run lint` en `client/`: correcto, sin errores reportados.
- Vite emitió una advertencia por el archivo JavaScript principal de 509,03 kB minificado; la compilación terminó correctamente. Queda como mejora evaluar división de código por rutas.
- Se contrastaron carga de datos, dirección de relaciones, selección, navegación y asociación de imágenes con el código. No se realizaron nuevas pruebas en navegador, Postman o Supabase.

Estas comprobaciones no constituyen pruebas automatizadas ni un reporte de cobertura. Queda pendiente registrar el recorrido visual con notas de distintas madureces, relaciones entrantes/salientes, imágenes asociadas, grafo vacío y navegación a la nota completa.

### Decisiones y límites vigentes
- Reutilizar los servicios y permisos existentes; no agregar endpoints ni modificar el modelo de datos para visualizar el grafo.
- Distinguir las relaciones entre notas de las asociaciones de imágenes. Estas últimas proceden de `gallery_images.note_id`, no de nuevas filas en `note_relations`.
- Mantener las posiciones y la selección en memoria; los movimientos no se guardan en PostgreSQL. La creación y eliminación persistente de relaciones se realiza desde el módulo de relaciones.
- Consultar relaciones por cada nota; queda pendiente evaluar el rendimiento con jardines grandes.
- Conservar el historial de la bitácora: se recuperaron del historial Git las entradas existentes de los módulos 7 y 8 y se incorporó el registro del frontend a partir del contexto maestro.
- Esta actualización modifica únicamente bitácora, README y contexto maestro local. Los cambios funcionales revisados ya existían; no se realizó commit ni push.

### Aprendizajes
El grafo puede construirse con los datos existentes del jardín sin cambiar el backend. Diferenciar visualmente las relaciones dirigidas y las asociaciones de imágenes ayuda a comprender el significado de cada conexión. El identificador de una nota en la URL permite conectar la exploración del grafo con su lectura completa.

### Resultado
Módulos 0–10 implementados dentro de su alcance. El grafo integra notas, relaciones, backlinks e imágenes asociadas, con navegación hacia el contenido y comprobaciones locales de build/lint correctas.

### Siguiente paso
Módulo 11 — Admin y visitante básico. Registrar además la validación funcional integral del frontend y grafo. Siguen pendientes SMTP propio, pruebas automatizadas y cobertura >=80 %, CI/CD, despliegue, OWASP ZAP, SonarQube, evidencias e informe final.


## 23 de septiembre de 2026 — Módulo 11: visitante básico, panel administrativo y validación transversal

### Estado
Implementado en el código local. Build, lint y suites automatizadas iniciales correctos; validación funcional integral en navegador y contra Supabase pendiente de registrar.

### Objetivo
Incorporar una experiencia pública de solo lectura para visitantes, un panel básico exclusivo para administradores y mensajes de validación comprensibles en los formularios y respuestas de la API.

### Trabajo realizado
- Se convirtió `/` en una página de inicio pública. `HomePage` presenta el proyecto y consulta hasta seis jardines públicos, mostrando autoría, descripción, total de notas y conteos de Semillas, Brotes y Árboles.
- Se agregó la ruta pública `/garden/:gardenId`. `PublicGardenPage` muestra nombre, descripción, autoría, notas con madurez y fechas, y el total de relaciones. No expone controles de edición ni la galería privada.
- Se crearon `GET /api/public/gardens` y `GET /api/public/gardens/:gardenId` mediante `public.routes.js`, `public.controller.js` y `public.service.js`. Solo consultan jardines con `is_public = true`; un jardín privado, inexistente o que deja de ser público responde `404`.
- Las lecturas públicas utilizan el cliente publicable de Supabase sin JWT y dependen de las políticas RLS ya definidas. La lista limita el resultado a seis jardines y calcula los conteos de notas mediante consultas `head` con conteo exacto, sin descargar su contenido.
- Se crearon `GET /api/admin/summary` y `GET /api/admin/users` mediante `admin.routes.js`, `admin.controller.js` y `admin.service.js`. Ambas rutas aplican `authenticate` y `authorizeRoles("admin")`.
- El resumen administrativo cuenta usuarios, jardines públicos/privados, notas, relaciones e imágenes. El listado muestra nombre, rol y jardín asociado con su visibilidad. El panel es solo de consulta: no cambia roles ni bloquea cuentas.
- Se agregó `/admin` al frontend. `ProtectedRoute` comparte el usuario validado con `AppLayout`; la navegación muestra el enlace únicamente al rol `admin` y `AdminRoute` redirige a usuarios normales. La API mantiene la autorización definitiva en el backend.
- Se separaron las operaciones HTTP comunes en `client/src/services/http.js`. Las lecturas públicas no renuevan, eliminan ni redirigen una sesión existente; las solicitudes protegidas conservan la renovación compartida y un único reintento ante `401`.
- Se agregó `ValidatedForm` y validación reutilizable para campos obligatorios, espacios en blanco, correo, longitudes e imágenes. Los errores se asocian mediante `aria-invalid`, `aria-describedby` y `role="alert"`, y el primer campo inválido recibe el foco.
- Se aplicaron límites coherentes en cliente y backend: nombre visible 80 caracteres, nombre de jardín 100, descripción del jardín 500, título de nota 200 y descripción de imagen 1000. Las imágenes admiten JPG, PNG o WEBP hasta 5 MiB.
- Se tradujeron y hicieron más accionables los mensajes de autenticación, permisos, recursos no encontrados, relaciones, galería, errores de Multer y errores conocidos de Supabase/PostgreSQL. Los errores inesperados ya no exponen detalles internos al cliente.
- Se añadió el script `npm test` con el runner nativo `node:test` en `client/` y `server/`. Las pruebas cubren utilidades de validación, límites de formularios, manejo de errores HTTP, conservación/renovación de sesión y rechazo temprano de datos inválidos en controladores.

Endpoints implementados:
- `GET /api/public/gardens`
- `GET /api/public/gardens/:gardenId`
- `GET /api/admin/summary`
- `GET /api/admin/users`

### Validaciones realizadas
- `npm test` en `server/`: correcto; `tests/validation.test.js` terminó sin fallos.
- `npm test` en `client/`: correcto; `tests/api.test.js` y `tests/validation.test.js` terminaron sin fallos.
- `npm run lint` en `client/`: correcto, sin errores reportados.
- `npm run build` en `client/`: correcto, 233 módulos transformados.
- `git diff --check`: correcto, sin errores de espacios en los cambios locales.
- Vite mantiene una advertencia por el archivo JavaScript principal de 525,35 kB minificado; no impide la compilación y queda pendiente la división de código.

Estas verificaciones son locales y no equivalen a una prueba funcional completa en navegador, una integración real contra Supabase ni un reporte de cobertura. Tampoco cierran todavía el requisito académico de Jest/Supertest y cobertura >=80 %.

### Decisiones y límites vigentes
- Mantener la visita pública en modo lectura y excluir del alcance público las imágenes, URLs firmadas y operaciones de edición.
- Ocultar la existencia de jardines privados con una respuesta `404`, sin diferenciar entre identificador inexistente y recurso no público.
- Mantener el panel administrativo como vista informativa del MVP. El bloqueo/desactivación de usuarios queda fuera de este cierre.
- Aplicar la restricción administrativa tanto en la interfaz como en Express; ocultar un enlace no sustituye la autorización del backend.
- Usar `node:test` para la primera regresión sin agregar dependencias. El Módulo 12 deberá ampliar casos, incorporar las herramientas de testing acordadas y medir la cobertura real.
- No se modificó la migración. Las vistas pública y administrativa reutilizan las políticas RLS y permisos existentes.
- Esta actualización documental modifica README, bitácora y contexto maestro. No realiza `git add`, commit ni push.

### Problemas encontrados
No se encontraron fallos durante build, lint o las suites ejecutadas. La advertencia de tamaño del bundle continúa y todavía falta comprobar manualmente los recorridos con visitante, usuario y administrador contra datos reales.

### Aprendizajes
La autorización debe comprobarse en el servidor aunque la interfaz oculte las opciones restringidas. Separar solicitudes públicas y protegidas evita que un fallo de una página pública altere una sesión válida. Los mensajes útiles requieren coherencia entre restricciones HTML, validación del cliente, controladores y base de datos.

### Resultado
Módulos 0–11 implementados dentro de su alcance. Digital Garden ya permite explorar jardines públicos sin cuenta y ofrece al rol administrador una vista general de solo lectura. También dispone de una primera base automatizada para validar formularios, errores HTTP y sesión.

### Siguiente paso
Módulo 12 — ampliar pruebas automatizadas con Jest/Supertest y medir cobertura >=80 %. También deben registrarse las pruebas funcionales integrales del frontend, grafo, experiencia pública y panel administrativo antes del cierre.


## 23 de septiembre de 2026 — Módulo 12: pruebas automatizadas y cobertura

### Estado
Completado. Las suites Jest y legacy terminan correctamente y el requisito global de cobertura se supera en las cuatro métricas.

### Objetivo
Formalizar las pruebas automatizadas del backend con Jest y Supertest, comprobar validaciones, errores, autenticación, autorización, controladores, servicios y rutas HTTP, y alcanzar al menos 80 % de cobertura global sin depender de servicios externos reales.

### Trabajo realizado
- Se configuró Jest para el backend ESM con entorno `node`, proveedor de cobertura V8 y medición de todos los archivos `src/**/*.js`.
- Se fijaron umbrales globales de 80 % para statements, branches, functions y lines.
- Se conservó `tests/validation.test.js` con `node:test` mediante el script `npm run test:legacy`; las nuevas pruebas Jest se aislaron en `tests/jest/`.
- Se añadieron pruebas unitarias para validadores, middleware de errores y carga, autenticación y roles, controladores y servicios.
- Se simuló completamente el cliente Supabase, incluidas las cadenas de consulta, autenticación y operaciones de Storage. Las pruebas verifican resultados, errores, transformaciones, ownership e interacciones relevantes sin realizar conexiones de red.
- Se añadieron pruebas HTTP con Supertest para salud de la API y base de datos, errores 404 y JSON malformado, CORS, rutas protegidas, autorización administrativa y operaciones representativas de jardines, notas, relaciones, galería y vistas públicas.
- Las pruebas de galería comprueban multipart y filtro MIME con buffers locales; no cargan archivos a Storage real.

### Resultados finales
- Jest: 22 suites y 289 pruebas correctas.
- Legacy: 22 pruebas correctas con `node:test`.
- Supertest: 19 pruebas HTTP.
- Statements: 99.47 %.
- Branches: 99.41 %.
- Functions: 100 %.
- Lines: 99.47 %.
- Los tres comandos de cierre, `npm run test:legacy`, `npm test` y `npm run test:coverage`, terminaron con código de salida 0.

El requisito académico de cobertura global mayor o igual a 80 % quedó ampliamente cumplido. Durante las pruebas unitarias y HTTP no se utilizaron conexiones reales a Supabase, operaciones reales de Storage ni credenciales reales.

### Observaciones técnicas
- `app.js`, las rutas, los middleware y los servicios alcanzaron 100 % en las cuatro métricas. `supabase.js` conserva ramas de configuración sin cubrir porque probarlas no aporta comportamiento funcional suficiente para justificar pruebas artificiales.
- `garden.controller.js` conserva las líneas 127–131 sin ejecutar; corresponden a una validación redundante respecto del flujo actual. No se modificó producción para perseguir 100 % global.
- Jest muestra la advertencia experimental de Node.js asociada a VM Modules, esperada por la ejecución ESM actual y sin impacto en el resultado.
- Las pruebas legacy se conservaron como regresión independiente y no fueron reemplazadas ni eliminadas.

### Resultado
Módulo 12 completado: el backend dispone de pruebas unitarias e integración HTTP representativa, dependencias externas aisladas mediante mocks y cobertura global verificable por encima del umbral requerido.
