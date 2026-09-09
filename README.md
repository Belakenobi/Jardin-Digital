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
- `docs/`: evidencias, pruebas, seguridad y calidad.
- `.github/workflows/`: configuración futura del pipeline CI/CD.
- `BITACORA_DESARROLLO.md`: registro del avance real del proyecto.

## Seguridad

Los secretos y credenciales no deben almacenarse en el repositorio. Los archivos `.env` reales serán ignorados por Git y solamente se versionarán plantillas `.env.example` sin valores sensibles.

## Estado actual

Módulo 0: creación de la estructura inicial, documentación base y configuración del control de versiones.

Todavía no se han instalado dependencias ni implementado funcionalidades.

## Próximo módulo

Configurar Supabase Cloud y diseñar el esquema relacional de la base de datos.