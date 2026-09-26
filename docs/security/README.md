# Pruebas de seguridad - OWASP ZAP

## Objetivo

Evaluar la seguridad de la aplicación Digital Garden desplegada en producción mediante OWASP ZAP, identificando configuraciones inseguras y vulnerabilidades dentro del alcance analizado.

## Herramienta

- OWASP ZAP 2.17.0
- Aplicación evaluada: https://digital-garden-web.onrender.com

## Hallazgos iniciales

Durante el primer análisis se identificaron, entre otros, los siguientes hallazgos:

- Content Security Policy (CSP) Header Not Set.
- Missing Anti-clickjacking Header.

Los resultados procedentes de dominios externos del navegador, como servicios de Mozilla, fueron excluidos del análisis del proyecto.

## Medidas correctivas probadas

Se configuraron encabezados HTTP de seguridad, incluyendo:

- Content-Security-Policy.
- X-Frame-Options: DENY.

Posteriormente se realizó un nuevo escaneo para verificar el efecto de las medidas implementadas.

## Resultado del reescaneo

El reporte final registró:

- High: 0
- Medium: 1
- Low: 1
- Informational: 4

Los hallazgos iniciales relacionados con ausencia de CSP y protección anti-clickjacking dejaron de aparecer durante el reescaneo.

El principal riesgo residual identificado fue el uso de `unsafe-inline` en la directiva `style-src`.

## XSS y SQL Injection

Dentro del alcance y las rutas evaluadas, OWASP ZAP no generó alertas asociadas a Cross-Site Scripting (XSS) ni SQL Injection (SQLi).

Este resultado corresponde únicamente al alcance del análisis realizado y no implica una garantía absoluta de ausencia de vulnerabilidades.

## Validación funcional

Después de aplicar una CSP restrictiva se detectó una incompatibilidad con la carga de imágenes almacenadas en Supabase Storage.

Para mantener funcional el MVP, la configuración CSP fue revertida posteriormente. Su implementación definitiva, restringiendo únicamente los orígenes externos necesarios, quedó registrada como mejora futura de seguridad.

## Evidencia

- `digital-garden-zap-final`: reporte técnico generado por OWASP ZAP.
- `digital-garden-zap-final_d/`: recursos utilizados por el reporte HTML.
