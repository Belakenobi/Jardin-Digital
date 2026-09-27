# Reporte de pruebas unitarias — Jest / Supertest

## 1. Objetivo

Se implementó y ejecutó una suite de pruebas automatizadas para el backend de
Digital Garden con el fin de verificar el comportamiento de la API y argumentar
el cumplimiento del requisito académico de **cobertura mínima del 80 %**.

El objetivo tuvo dos componentes:

- Demostrar que la lógica del servidor (servicios, controladores, rutas,
  middleware y validadores) se comporta según lo esperado.
- Medir la cobertura de código y comprobar que supera el umbral de 80 %
  establecido, dejando el resultado documentado como evidencia.

## 2. Herramientas y entorno

- Node.js 24 (ESM, `"type": "module"`).
- Jest 30.5.2 — runner y biblioteca de aserciones.
- Supertest 7.3.0 — pruebas de integración HTTP.
- `node:test` — suite complementaria del frontend.
- Proveedor de cobertura: **V8** (métricas nativas de V8, sin instrumentación
  adicional del código fuente).

## 3. Configuración del análisis

La configuración reproducible se encuentra en `server/jest.config.js`:

```js
export default {
  testEnvironment: "node",
  coverageProvider: "v8",
  testMatch: ["<rootDir>/tests/jest/**/*.test.js"],
  collectCoverageFrom: ["<rootDir>/src/**/*.js"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

Puntos clave:

- **Alcance de las pruebas:** `server/tests/jest/**/*.test.js`.
- **Alcance de la cobertura:** la totalidad de `server/src/**/*.js`
  (**30 archivos, 2,952 líneas**).
- **Umbral exigido:** 80 % en las cuatro métricas (statements, branches,
  functions y lines). El umbral es **global**, no por archivo.

El umbral no es una declaración teórica: está declarado en
`coverageThreshold`, por lo que **Jest falla la ejecución** (`npm run
test:coverage` devuelve código de salida distinto de 0) si la cobertura global
queda por debajo de 80 % en cualquiera de las cuatro métricas.

## 4. Comandos de ejecución

```sh
# Backend: suite completa (22 suites, 289 pruebas)
cd server && npm test

# Backend: suite completa con medición de cobertura y validación de umbral
cd server && npm run test:coverage

# Frontend: suite complementaria (9 pruebas)
cd client && npm test
```

## 5. Resultado general de la ejecución

La suite se ejecutó sin errores. El resultado fue:

| Métrica | Resultado |
| --- | ---: |
| Test Suites | 22 passed / 22 total |
| Tests | 289 passed / 289 total |
| Fallos | 0 |
| Pruebas omitidas (`skipped`) | 0 |
| Pruebas pendientes (`todo`) | 0 |
| Instantáneas (`snapshots`) | 0 |
| Tiempo de ejecución | ≈ 4,2 s |

El 100 % de las pruebas pasa, sin casos ignorados ni pruebas
desactivadas mediante `skip` o `todo`.

## 6. Cobertura obtenida y cumplimiento del umbral de 80 %

Cobertura global medida sobre `server/src`:

| Métrica | Umbral exigido | Cobertura obtenida | Margen |
| --- | ---: | ---: | ---: |
| Statements | 80 % | **96,57 %** | +16,57 pp |
| Branches | 80 % | **99,41 %** | +19,41 pp |
| Functions | 80 % | **97,43 %** | +16,57 pp |
| Lines | 80 % | **96,57 %** | +16,57 pp |

Detalle en términos absolutos:

| Métrica | Cubierto | Total | % |
| --- | ---: | ---: | ---: |
| Líneas | 2,851 | 2,952 | 96,58 % |
| Ramas (branches) | 508 | 511 | 99,41 % |
| Funciones | 76 | 78 | 97,44 % |

**El requisito de cobertura ≥ 80 % se cumple con holgura en las cuatro
métricas.** El margen mínimo es de 16,57 puntos porcentuales por encima del
umbral, y solo 101 líneas, 3 ramas y 2 funciones del backend permanecen sin
ejectuar.

## 7. Cobertura por capa arquitectónica

| Capa / directorio | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| `src/` (app.js) | 100 % | 100 % | 100 % | 100 % |
| `src/config` | 75,60 % | 33,33 % | 100 % | 75,60 % |
| `src/controllers` | 97,53 % | 99,49 % | 96,66 % | 97,53 % |
| `src/middleware` | 100 % | 100 % | 100 % | 100 % |
| `src/routes` | 100 % | 100 % | 100 % | 100 % |
| `src/services` | 94,92 % | 100 % | 97,29 % | 94,92 % |
| `src/validators` | 100 % | 100 % | 100 % | 100 % |

La cobertura es del 100 % en las capas de rutas, middleware y validadores, es
decir, en toda la capa de transporte y validación de entrada. La cobertura de
servicios es de 94,92 %.

### 7.1 Archivos al 100 % de cobertura

De los **30 archivos** del alcance, **27 alcanzan el 100 % en las cuatro
métricas** (statements, branches, functions y lines):

- `src/app.js`
- `src/controllers/admin.controller.js`
- `src/controllers/auth.controller.js`
- `src/controllers/gallery.controller.js`
- `src/controllers/note.controller.js`
- `src/controllers/profile.controller.js`
- `src/controllers/public.controller.js`
- `src/controllers/relation.controller.js`
- `src/middleware/auth.middleware.js`
- `src/middleware/error.middleware.js`
- `src/middleware/upload.middleware.js`
- Las 8 rutas: `admin`, `auth`, `gallery`, `garden`, `note`, `profile`,
  `public`, `relation` (`.routes.js`)
- `src/services/admin.service.js`, `auth.service.js`, `gallery.service.js`,
  `note.service.js`, `profile.service.js`, `public.service.js`,
  `relation.service.js`
- `src/validators/auth.validator.js`

Los 3 archivos restantes se detallan en la sección 11.

## 8. Pruebas por suite

Desglose de las 22 suites y sus 289 pruebas:

| Suite | Pruebas | Capa |
| --- | ---: | --- |
| `validation.test.js` | 53 | validadores |
| `error-middleware.test.js` | 26 | middleware |
| `gallery-service.test.js` | 20 | servicios |
| `relation-service.test.js` | 19 | servicios |
| `note-service.test.js` | 19 | servicios |
| `auth-controller.test.js` | 19 | controladores |
| `note-controller.test.js` | 18 | controladores |
| `auth-middleware.test.js` | 14 | middleware |
| `relation-controller.test.js` | 13 | controladores |
| `public-service.test.js` | 11 | servicios |
| `garden-controller.test.js` | 10 | controladores |
| `auth-service.test.js` | 9 | servicios |
| `garden-service.test.js` | 8 | servicios |
| `gallery-controller.test.js` | 8 | controladores |
| `admin-profile-controller.test.js` | 8 | controladores |
| `crud-http.test.js` | 7 | integración HTTP |
| `admin-service.test.js` | 6 | servicios |
| `app-http.test.js` | 6 | integración HTTP |
| `public-controller.test.js` | 5 | controladores |
| `auth-routes.test.js` | 5 | integración HTTP |
| `profile-service.test.js` | 4 | servicios |
| `health.test.js` | 1 | integración HTTP |
| **Total** | **289** | **22 suites** |

## 9. Técnicas de prueba utilizadas

### 9.1 Aislamiento mediante dobles de prueba

El backend depende de Supabase (PostgreSQL, Auth y Storage). Para que las
pruebas sean deterministas y no requieran una instancia real de Supabase, se
utilizan dobles de prueba inyectados por parámetro. Los auxiliares están en
`server/tests/jest/helpers/`:

- `createSupabaseSequence()` / `createQuery()`: construyen un cliente falso cuyo
  constructor de consultas (`select`, `eq`, `in`, `order`, `limit`, `insert`,
  `update`, `delete`, `single`, `maybeSingle`) devuelve el mismo objeto
  encadenable, de modo que la suite puede programar una secuencia de respuestas
  y afirmar sobre las llamadas realizadas.
- `createRequest()` / `createResponse()`: fabrican objetos `req` y `res` de
  Express con `status` y `json` como funciones de seguimiento, lo que permite
  verificar los códigos de estado y los cuerpos de respuesta generados por los
  controladores.

Este enfoque verifica las consultas efectuadas a la base de datos (qué tabla,
qué filtros y qué operación) sin necesitar una base de datos real.

### 9.2 Pruebas de integración HTTP con Supertest

Cuatro suites usan Supertest para levantar la aplicación Express en memoria y
ejecutar peticiones HTTP reales:

- `health.test.js`
- `app-http.test.js`
- `auth-routes.test.js`
- `crud-http.test.js`

Estas pruebas validan el encadenamiento real de middleware, autenticación,
autorización por rol y controladores a través de los códigos de estado HTTP,
complementando las pruebas unitarias por capa.

### 9.3 Casos límite y de error

Además del camino feliz, la suite cubre:

- Validación de campos obligatorios, longitudes mínimas y máximas y formato de
  correo.
- Validación de imágenes: presencia, tipo MIME y límite exacto de 5 MB.
- Manejo centralizado de errores y respuestas `4xx`/`5xx`.
- Renovación de sesión ante `401` y expiración de sesión cuando el refresh
  falla.

## 10. Suite complementaria del frontend

El frontend (`client/`) ejecuta **9 pruebas** mediante el runner nativo
`node:test`, sin dependencias externas:

| Métrica | Resultado |
| --- | ---: |
| Tests | 9 passed / 9 total |
| Fallos | 0 |

Cobertura probada: validaciones de formulario (campos vacíos, selecciones
faltantes, correos malformados, longitudes), validación de imágenes (presencia,
tipo y límite de 5 MB), manejo de fallos de red y de respuestas no JSON, y
renovación/expiración de sesión en peticiones protegidas.

**Esta suite no instrumenta cobertura**, por lo que **no computa para el
requisito del 80 %**. El umbral de cobertura se verifica exclusivamente sobre
el backend, mediante Jest, que es el proyecto donde reside la lógica de
negocio y las reglas de autorización.

## 11. Brechas de cobertura identificadas

De los 30 archivos del alcance, 3 no alcanzan el 100 %. Dos de ellos quedan por
debajo del 80 % en alguna métrica y el tercero se sitúa justo en el umbral. Ninguno
afecta al resultado global, porque `coverageThreshold` está configurado como
global, pero se documentan de forma transparente:

| Archivo | Lines | Branches | Functions | Motivo |
| --- | ---: | ---: | ---: | --- |
| `src/services/garden.service.js` | 55,48 % (81/146) | 100 % | 75 % (3/4) | `deleteGarden()` (líneas 82-146) sin cubrir: bucle de paginación por lotes de imágenes y eliminación en Supabase Storage. |
| `src/config/supabase.js` | 75,61 % (31/41) | 33,33 % (1/3) | 100 % | Lanzamiento por variables de entorno ausentes (líneas 8-11) y rama del encabezado `Authorization` con token (líneas 25-30). |
| `src/controllers/garden.controller.js` | 87 % | 97,82 % | 80 % (4/5) | Rama de error no ejecutada (líneas 128-132 y 180-200). |

Estas brechas están justificadas por su naturaleza:

- `garden.service.js`: la lógica pendiente requiere un doble de Storage con
  múltiples páginas de resultados; las 8 pruebas actuales de la suite cubren
  `getGarden`, `createGarden`, `updateGarden` y el camino de jardín inexistente.
- `supabase.js`: los caminos no cubiertos son la validación de variables de
  entorno en el arranque del proceso y la construcción del encabezado
  `Bearer`, que solo se activa con un token de usuario.
- `garden.controller.js`: sus funciones alcanzan exactamente el 80 % exigido,
  por lo que cumple el umbral, y la cobertura de líneas (87 %) y ramas (97,82 %)
  también lo superan.

## 12. Ejecución automatizada (CI/CD)

La suite se ejecuta automáticamente en GitHub Actions mediante
`.github/workflows/ci.yml`:

| Job | Comandos |
| --- | --- |
| `backend` | `npm ci` → `npm run test:coverage` |
| `frontend` | `npm ci` → `npm test` → `npm run lint` → `npm run build` |
| `deploy` | despliegue a Render, condicionado a que ambos jobs anteriores pasen |

El job `backend` invoca `npm run test:coverage`, es decir, ejecuta la
validación del umbral de 80 % en cada `push` y `pull_request` sobre `main`. Si
la cobertura cayera por debajo del umbral, el pipeline fallaría y el despliegue
se detendría. Esto convierte el requisito de cobertura en una comprobación
automática y no manual.

## 13. Integración con SonarQube

SonarQube reporta una cobertura global de **77,3 %**, calculada sobre el
alcance combinado `client/src` + `server/src` e importando `server/coverage/lcov.info`.

Ambas cifras corresponden a alcances distintos y ambas son correctas:

- **77,3 %** — SonarQube, alcance combinado (frontend + backend).
- **96,57 %** — Jest, solo backend, que es donde se aplica el requisito del 80 %.

La diferencia se explica porque el frontend aporta miles de líneas (7,430
líneas de código) con solo 9 pruebas, mientras que el backend aporta 2,952
líneas con 289 pruebas. El reporte de SonarQube señala explícitamente que "la
comprobación del requisito académico de cobertura de pruebas unitarias se
realiza mediante el reporte de Jest del backend".

## 14. Conclusiones

1. **El requisito de cobertura ≥ 80 % se cumple.** Las cuatro métricas
   globales (statements, branches, functions y lines) superan el umbral, con un
   mínimo de 96,57 %.
2. **El umbral está codificado, no documentado.** `coverageThreshold` en
   `server/jest.config.js` hace que Jest falle si la cobertura baja del 80 %,
   y el pipeline de CI ejecuta esa validación en cada cambio.
3. **La suite es estable y completa:** 289 pruebas en 22 suites, todas en
   verde, sin pruebas omitidas ni desactivadas y con un tiempo de ejecución de
   ~4,2 s.
4. **La cobertura es heterogenea por capa:** el 100 % en rutas, middleware y
   validadores, y 94,92 % en servicios.
5. **Quedan dos brechas puntuales y documentadas**
   (`garden.service.js` y `supabase.js`) que no comprometen el resultado
   global y que identifican trabajo futuro de pruebas.
6. **La suite de frontend (9 pruebas) es complementaria** y no participa en la
   métrica de cobertura.

## 15. Evidencia

- `server/jest.config.js`: configuración de Jest, alcance de cobertura y
  umbral de 80 %.
- `server/tests/jest/`: 22 suites de pruebas del backend.
- `server/tests/jest/helpers/`: dobles de prueba para Supabase y para
  `req`/`res` de Express.
- `client/tests/`: suite complementaria del frontend.
- `.github/workflows/ci.yml`: ejecución automatizada de la suite con
  validación de cobertura.
- Reportes de cobertura generados en `server/coverage/`
  (`lcov.info`, `lcov-report/`, `clover.xml`, `coverage-final.json`).

> El directorio `coverage/` está excluido por `.gitignore`, por lo que los
> reportes se regeneran ejecutando `npm run test:coverage` en `server/`. El
> archivo `server/coverage/lcov.info` es el que se importa en SonarQube.

Este reporte documenta el resultado de las pruebas unitarias del backend de
Digital Garden y el cumplimiento del requisito de cobertura mínima del 80 %.

---

**Fecha de ejecución:** 26 de septiembre de 2026
**Rama:** `main` (commit `c3430fe`)
**Entorno:** Node.js 24.20.0 en Linux
**Resultado:** 22/22 suites, 289/289 pruebas, cobertura global 96,57 %
**Estado del requisito ≥ 80 %:** Cumplido
