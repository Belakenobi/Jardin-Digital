# Reporte de calidad de código — SonarQube

## 1. Objetivo

Se utilizó SonarQube para realizar un análisis estático de la calidad del
código de Digital Garden. El análisis incluye el frontend desarrollado con
React y el backend desarrollado con Node.js/Express.

El objetivo fue identificar problemas relacionados con mantenibilidad,
fiabilidad y seguridad, así como documentar las métricas generadas por
SonarQube, incluyendo deuda técnica, code smells, cobertura, duplicación y
complejidad.

## 2. Configuración del análisis

- Proyecto: Digital Garden
- Project Key: `digital-Garden`
- Herramienta: SonarQube Community Build
- Modo de análisis: MQR Mode
- Ejecución: SonarScanner local
- Código analizado: `client/src` y `server/src`
- Reporte de cobertura importado: `server/coverage/lcov.info`

La configuración reproducible del análisis se encuentra en el archivo
`sonar-project.properties` ubicado en la raíz del repositorio.

## 3. Resultado general del análisis

El análisis completó correctamente el Quality Gate configurado por SonarQube.
Sin embargo, se identificaron hallazgos relacionados principalmente con
mantenibilidad y fiabilidad que representan oportunidades de mejora en el
código.

### Métricas principales

| Métrica | Resultado |
| --- | ---: |
| Quality Gate | Passed |
| Líneas de código | 9,856 |
| Code Smells | 25 |
| Deuda técnica total | 159 min (2 h 39 min) |
| Debt Ratio | 0.1 % |
| Maintainability Rating | A |
| Maintainability Issues | 23 |
| Reliability Rating | C |
| Reliability Issues | 7 |
| Security Rating | A |
| Bugs | 0 |
| Vulnerabilidades | 0 |
| Coverage | 77.3 % |
| Duplicación | 1.4 % |
| Complejidad ciclomática | 937 |
| Complejidad cognitiva | 700 |

Las métricas `code_smells`, `sqale_index`, `sqale_debt_ratio`, cobertura,
duplicación y complejidad fueron obtenidas directamente mediante la API de
SonarQube y se conservan en `sonarqube-metricas-iniciales.json`.

## 4. Deuda técnica y Code Smells

La API de SonarQube reportó **25 code smells** y una deuda técnica
(`sqale_index`) de **159 minutos**, equivalente a **2 horas con 39 minutos**.

El Debt Ratio obtenido mediante la API fue de **0.1 %**.

Por otra parte, la interfaz de SonarQube en MQR Mode muestra **23 impactos de
mantenibilidad**, con una estimación de esfuerzo de **1 hora con 59 minutos**
y una calificación de mantenibilidad **A**.

Estas métricas se documentan por separado debido a que la API conserva
métricas de tipo `code_smells`, mientras que MQR Mode presenta los hallazgos
según su impacto en las diferentes cualidades del software.

Los 25 hallazgos abiertos obtenidos directamente mediante la API se conservan
en `sonarqube-hallazgos-iniciales.json`.

## 5. Análisis de los hallazgos

Los resultados muestran que los principales puntos de mejora se concentran en
la mantenibilidad y legibilidad del código. También se identificaron dos
expresiones regulares que tienen impacto en la fiabilidad.

### 5.1 Complejidad cognitiva

El hallazgo de mayor severidad se encuentra en:

`client/src/utils/validation.js`

La función `getFieldError()` presenta una complejidad cognitiva de **23**,
mientras que la regla utilizada por SonarQube establece un máximo permitido
de **15**.

El hallazgo fue clasificado con severidad `CRITICAL` mediante la API y con
impacto alto en mantenibilidad dentro de MQR Mode. SonarQube estima un
esfuerzo de **13 minutos** para su refactorización.

La función concentra diferentes decisiones relacionadas con la validación de
campos, lo que incrementa la dificultad de lectura y mantenimiento. Este
hallazgo indica que sería conveniente dividir la lógica en funciones más
pequeñas y específicas durante futuras tareas de mantenimiento.

### 5.2 Ternarios anidados

Se identificaron **9 operaciones ternarias anidadas** distribuidas en
diferentes archivos del frontend, servicios y middleware.

SonarQube recomienda extraer estas operaciones a instrucciones independientes.
El objetivo de esta recomendación es reducir la complejidad visual de las
condiciones y facilitar la comprensión del flujo lógico del código.

Cada uno de estos hallazgos tiene un esfuerzo estimado de **5 minutos**.

### 5.3 Expresiones regulares

Se identificaron **2 expresiones regulares** con posibilidad de presentar
rendimiento superlineal debido a backtracking.

Los archivos afectados son:

- `client/src/utils/validation.js`
- `server/src/validators/auth.validator.js`

Cada hallazgo tiene un esfuerzo estimado de **20 minutos**.

A diferencia de la mayoría de los hallazgos encontrados, estos problemas
también tienen impacto en la fiabilidad del proyecto, por lo que forman parte
de los resultados que explican la calificación de Reliability obtenida por
SonarQube.

### 5.4 Accesibilidad y semántica HTML

SonarQube identificó recomendaciones relacionadas con el uso de elementos
HTML semánticos.

Se encontraron:

- 3 casos donde se recomienda utilizar `<output>` en lugar de `role="status"`.
- 1 caso relacionado con el uso semántico de una imagen mediante `<img>` y
  su atributo `alt`.

Estos hallazgos buscan mejorar la semántica de la interfaz y su compatibilidad
con herramientas de accesibilidad.

### 5.5 Espaciado ambiguo en JSX

Se identificaron **5 problemas de espaciado ambiguo** en componentes JSX.

Estos hallazgos aparecen en diferentes páginas del frontend y están
relacionados con la forma en que el contenido textual y los elementos HTML
son representados.

Aunque su esfuerzo individual estimado es bajo, SonarQube los considera
relevantes para mejorar la consistencia y claridad del código.

### 5.6 Otros hallazgos de mantenibilidad

También se identificaron los siguientes puntos:

- 2 estructuras que SonarQube recomienda implementar mediante `Set`.
- 1 función que puede trasladarse a un scope exterior.
- 1 selector CSS duplicado.

Estos hallazgos tienen un impacto individual menor, pero representan
oportunidades para simplificar estructuras y mejorar la consistencia general
del código.

## 6. Fiabilidad

SonarQube reportó:

- Reliability Rating: **C**
- Reliability Issues: **7**
- Remediation Effort: **1 h 5 min**

Los problemas de fiabilidad incluyen principalmente las dos expresiones
regulares con posibilidad de rendimiento superlineal y los hallazgos de
espaciado ambiguo detectados en JSX.

La calificación obtenida permite identificar la fiabilidad como uno de los
principales aspectos susceptibles de mejora dentro del análisis realizado.

## 7. Cobertura

SonarQube reportó una cobertura global de **77.3 %**.

El desglose mostrado por la herramienta fue:

- Line Coverage: **74.4 %**
- Condition Coverage: **99.4 %**
- Lines to Cover: **3,823**
- Uncovered Lines: **979**
- Conditions to Cover: **511**
- Uncovered Conditions: **3**

Este resultado se documenta como una métrica propia del alcance configurado
para el análisis de SonarQube.

La comprobación del requisito académico de cobertura de pruebas unitarias se
realiza mediante el reporte de Jest del backend. Por esta razón, el resultado
de cobertura de SonarQube y el reporte de Jest se conservan como evidencias
independientes.

## 8. Duplicación de código

SonarQube reportó una densidad de código duplicado de **1.4 %**.

El análisis identificó:

- Líneas duplicadas: **153**
- Bloques duplicados: **5**
- Archivos con duplicación: **4**

Los archivos identificados fueron:

- `client/src/components/AppLayout.jsx`
- `client/src/pages/RelationComposerPage.jsx`
- `client/src/pages/NotesPage.jsx`
- `client/src/pages/RelationsPage.jsx`

La duplicación detectada se concentra en una parte reducida del código
analizado. Esta información permite localizar las áreas que podrían
beneficiarse de una futura refactorización para reutilizar lógica o
componentes comunes.

## 9. Complejidad

El análisis registró las siguientes métricas globales:

- Complejidad ciclomática: **937**
- Complejidad cognitiva: **700**

La complejidad ciclomática representa los diferentes caminos de decisión
presentes en el código, mientras que la complejidad cognitiva permite estimar
la dificultad de comprender su lógica.

Estos valores corresponden al conjunto completo del código analizado y no
determinan por sí solos la calidad de cada función. Por esta razón se
complementan con los hallazgos específicos identificados por SonarQube, como
el caso de `getFieldError()`.

## 10. Tamaño del código analizado

SonarQube analizó un total de **9,856 líneas de código** distribuidas entre
frontend y backend.

El desglose principal fue:

- `client/src`: **7,430 líneas de código**
- `server/src`: **2,426 líneas de código**
- Archivos analizados: **69**
- Functions: **365**
- Statements: **1,664**

Estas métricas permiten contextualizar los resultados de mantenibilidad,
complejidad, cobertura y duplicación respecto al tamaño total del proyecto.

## 11. Seguridad

El análisis estático de SonarQube reportó:

- Security Rating: **A**
- Security Issues: **0**
- Security Remediation Effort: **0**
- Bugs: **0**
- Vulnerabilidades: **0**

No se identificaron vulnerabilidades abiertas mediante el análisis estático
realizado por SonarQube.

Estos resultados corresponden exclusivamente al análisis de código realizado
por esta herramienta. Las pruebas dinámicas de seguridad se realizaron por
separado mediante OWASP ZAP y se documentan en la sección de seguridad del
repositorio.

Ambos análisis son complementarios: SonarQube examina principalmente el
código fuente, mientras que OWASP ZAP evalúa el comportamiento de la
aplicación desplegada.

## 12. Conclusiones del análisis

El análisis de SonarQube permitió obtener una visión general de la calidad
del código de Digital Garden.

El proyecto superó el **Quality Gate** configurado y obtuvo una calificación
**A en mantenibilidad y seguridad**. No se reportaron bugs ni vulnerabilidades
mediante las métricas consultadas.

Los principales puntos de mejora identificados se concentran en la
mantenibilidad y fiabilidad. SonarQube reportó **25 code smells**, una deuda
técnica total estimada de **159 minutos (2 h 39 min)** y una calificación
**C en fiabilidad**.

Entre los hallazgos más relevantes se encuentran una función con complejidad
cognitiva superior al límite establecido, operaciones ternarias anidadas,
dos expresiones regulares con posible rendimiento superlineal y diferentes
recomendaciones relacionadas con semántica, accesibilidad y estructura del
código.

Los resultados obtenidos permiten identificar de forma concreta las áreas que
pueden ser consideradas en futuras tareas de mantenimiento, sin modificar el
funcionamiento actual de la aplicación como parte de este análisis.

## 13. Evidencia

Para conservar resultados verificables y reproducibles, se incluyen en el
repositorio los siguientes archivos:

- `sonarqube-metricas-iniciales.json`: métricas obtenidas directamente
  mediante la API de SonarQube.
- `sonarqube-hallazgos-iniciales.json`: 25 hallazgos abiertos obtenidos
  directamente mediante la API de SonarQube.
- `sonar-project.properties`: configuración utilizada para ejecutar el
  análisis, ubicada en la raíz del repositorio.
- `evidencias/`: directorio destinado a las capturas representativas del
  análisis realizado en SonarQube.

Este reporte documenta los resultados obtenidos durante el análisis de calidad
del código con SonarQube. Los hallazgos identificados se conservan como
referencia para futuras acciones de mantenimiento y mejora del proyecto.
