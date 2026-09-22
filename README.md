# Digital Garden

Aplicación web para cultivar conocimiento personal mediante notas, relaciones e imágenes. Las ideas evolucionan de **semilla 🌱** a **brote 🌿** y **árbol 🌳**.

## Estado actual

Actualizado al **22 de septiembre de 2026**. Módulos **0–10 implementados**, incluidos el frontend y el grafo interactivo. El backend cuenta con pruebas manuales registradas; el frontend compila y pasa ESLint. Las pruebas automatizadas y la cobertura >=80 % siguen pendientes.

- Registro, login, rutas protegidas y sesión persistida en el navegador, con renovación de tokens ante respuestas `401` y cierre local de sesión.
- Dashboard con resumen del jardín, conteos por madurez y notas recientes.
- Creación del jardín y edición de perfil, nombre, descripción y visibilidad.
- CRUD de notas con filtro por madurez; creación, consulta y eliminación de relaciones y backlinks.
- Galería privada: carga de JPG, PNG y WEBP (hasta 5 MiB), edición de descripción/asociación con notas y eliminación.
- Grafo protegido con React Flow y distribución mediante d3-force: notas por madurez, relaciones dirigidas, zoom, arrastre y resaltado de conexiones/backlinks.
- Imágenes asociadas como nodos del grafo, con miniaturas y panel de detalle; navegación desde la vista previa a la nota completa resaltada.
- Interfaz adaptable con estados de carga, mensajes y confirmación de eliminaciones.

**Siguiente:** Módulo 11 — panel administrativo y visitante básico. También quedan pendientes registrar la validación funcional integral del frontend/grafo, pruebas automatizadas, CI/CD, despliegue y evaluaciones de seguridad/calidad.

El grafo reutiliza la API existente y muestra solo imágenes vinculadas a notas. Las posiciones se conservan en memoria; las relaciones se administran desde su módulo. Build y lint comprobados el 22 de septiembre; Vite advierte de un archivo JavaScript principal mayor de 500 kB, pendiente de optimización.

## Stack y estructura

- `client/`: React 19, Vite 8, Tailwind CSS 4, React Router, React Flow (`@xyflow/react`) y `d3-force`.
- `server/`: API REST con Node.js, Express y Multer; Docker con Node.js 24 Alpine.
- `supabase/migrations/`: PostgreSQL, restricciones y políticas RLS. Supabase también proporciona Auth y Storage.
- `docs/`: espacio para evidencias, pruebas y calidad.
- [Bitácora de desarrollo](BITACORA_DESARROLLO.md): historial, decisiones y validaciones.

El frontend consume la API; Express valida identidad, permisos y reglas de negocio con JWT y un cliente Supabase sujeto a RLS.

## Desarrollo local

Usar Node.js 24 y npm. Configurar un proyecto Supabase con la migración de `supabase/migrations/` y el bucket privado descrito abajo.

Backend:

```sh
cd server
cp .env.example .env
npm ci
npm run dev
```

Completar las variables Supabase de `server/.env`. La API usa `http://localhost:4000/api` y permite por defecto el origen `http://localhost:5173` mediante `CLIENT_URL`.

Frontend, en otra terminal:

```sh
cd client
cp .env.example .env
npm ci
npm run dev
```

Configurar `VITE_API_URL=http://localhost:4000/api`. Las variables `VITE_SUPABASE_*` de la plantilla no se usan en el cliente actual. Para verificarlo, ejecutar `npm run build` y `npm run lint` desde `client/`.

## Galería y sesión

Crear manualmente el bucket privado `gallery` en Supabase, con límite de 5 MB y MIME `image/jpeg`, `image/png`, `image/webp`. Sus políticas de `storage.objects` para `authenticated` deben permitir INSERT (`WITH CHECK`), SELECT y DELETE (`USING`) con esta condición:

```sql
bucket_id = 'gallery'
AND (storage.foldername(name))[1] = auth.uid()::text
```

El bucket y sus políticas de Storage aún no tienen migración. La API recibe el archivo en el campo multipart `image` y devuelve URLs firmadas de una hora al listar. Storage y PostgreSQL se actualizan en operaciones separadas.

La sesión se guarda en `localStorage` (`dg_session`); el cliente solicita `POST /api/auth/refresh` para renovarla. Cerrar sesión elimina los datos locales, sin revocación remota. Nunca versionar archivos `.env` ni exponer `SUPABASE_SECRET_KEY` al frontend.
