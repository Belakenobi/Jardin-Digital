<p align="center">
  <img src="docs/assets/favicon.png" alt="Digital Garden Logo" width="150">
</p>

<h1 align="center">🌱 Digital Garden</h1>

<p align="center">
  <strong>Cultiva ideas. Conecta pensamientos. Observa cómo crece tu conocimiento.</strong>
</p>

<p align="center">
  Aplicación web full stack para organizar conocimiento personal mediante notas,
  relaciones, imágenes y un grafo interactivo.
</p>

---

## 🌿 Sobre Digital Garden

**Digital Garden** nace de la idea de que no todos nuestros pensamientos aparecen terminados.

A veces una frase, una palabra o un título son suficientes para comenzar algo que puede crecer con el tiempo.

Por ello, las notas evolucionan mediante tres estados:

- 🌱 **Semilla** — una idea inicial.
- 🌿 **Brote** — una idea en desarrollo.
- 🌳 **Árbol** — una idea madura.

Además de almacenar contenido, Digital Garden permite **relacionar ideas, consultar backlinks y visualizar el conocimiento mediante un grafo interactivo**, transformando una colección de notas en una representación más cercana a la forma en que conectamos nuestros pensamientos.

---

## ✨ Funcionalidades

- 🔐 Registro, login y autenticación mediante JWT.
- 👥 Roles `user` y `admin`.
- 🌱 Jardín personal público o privado.
- 📝 CRUD completo de notas.
- 🌿 Estados de madurez: Semilla, Brote y Árbol.
- 🔗 Relaciones entre notas y backlinks.
- 🧠 Grafo interactivo del conocimiento.
- 🖼️ Galería privada con Supabase Storage.
- 🌎 Exploración pública de jardines.
- 🛡️ Panel administrativo protegido por rol.
- ✅ Validaciones y manejo de errores.
- 🧪 Pruebas automatizadas y cobertura.
- 🚀 CI/CD y despliegue automático.

---

## 🌐 Demo

### Frontend
**https://digital-garden-web.onrender.com**

### Backend API
**https://digital-garden-api-f563.onrender.com**

> La base de datos, autenticación y almacenamiento utilizan **Supabase Cloud**.

---

## 🛠️ Tecnologías

| Área | Tecnologías |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Grafo | React Flow, d3-force |
| Backend | Node.js, Express |
| Base de datos | PostgreSQL |
| Cloud | Supabase |
| Autenticación | Supabase Auth + JWT |
| Storage | Supabase Storage |
| Testing | Jest, Supertest |
| Calidad | ESLint, SonarQube |
| Seguridad | OWASP ZAP |
| DevOps | Docker, GitHub Actions |
| Deploy | Render |

---

## 🏗️ Arquitectura

```text
              ┌─────────────────────┐
              │       React         │
              │    Vite + UI        │
              └──────────┬──────────┘
                         │
                    HTTP / JSON
                         │
              ┌──────────▼──────────┐
              │   Node.js / Express │
              │      REST API       │
              ├─────────────────────┤
              │ Auth · Roles · RLS  │
              │ Validación · Lógica │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │      Supabase       │
              ├─────────────────────┤
              │ PostgreSQL          │
              │ Auth                │
              │ Storage             │
              └─────────────────────┘
