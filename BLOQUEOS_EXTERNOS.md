# BLOQUEOS_EXTERNOS.md — MINERAL-01 FASE 2

## Bloqueos identificados

### 1. Descompresión LAZ en el navegador

| Campo | Valor |
|---|---|
| Bloqueo | BLOCKED_RUNTIME |
| Causa | LAZ usa compresión LASzip (formato propietario abierto). No existe una implementación JS/WASM mantenida y compatible que funcione de forma fiable en el navegador para archivos grandes. |
| Impacto | No se pueden leer puntos individuales. Solo cabecera. |
| Alternativa | Microservicio con laz-perf (C++) o laszip. GitHub Actions para procesamiento por lotes. |
| Estado | No se simula procesamiento. `status: BLOCKED_RUNTIME`. |

### 2. CORS en consulta IGME

| Campo | Valor |
|---|---|
| Bloqueo | BLOCKED_EXTERNAL |
| Causa | El servidor IGME (mapas.igme.es) no envía cabeceras CORS para peticiones desde orígenes arbitrarios. |
| Impacto | No se puede consultar BDMIN Indicios directamente desde el navegador. |
| Alternativa | Proxy del lado servidor. allorigins.win solo para desarrollo. |
| Estado | `status: QUERY_FAILED`. `totalFeatures: null`. No se devuelve 0. |

### 3. Descarga de MDT oficial

| Campo | Valor |
|---|---|
| Bloqueo | BLOCKED_EXTERNAL |
| Causa | El MDT oficial del IGN-CNIG requiere descarga manual desde centrodedescargas.cnig.es. No hay API pública de descarga directa con cobertura verificada para el área. |
| Impacto | No se puede generar hillshade, pendiente, curvatura ni detección de anomalías sobre MDT real. |
| Alternativa | Importación manual del GeoTIFF por el usuario. |
| Estado | `conclusion: INSUFFICIENT_DATA`. Recuentos: `null`. |

### 4. Ubicación del Cortijo de Daniela

| Campo | Valor |
|---|---|
| Bloqueo | UNVERIFIED |
| Causa | No se ha localizado el Cortijo de Daniela en cartografía oficial con precisión suficiente para asignar coordenadas. |
| Impacto | No se atribuyen anomalías ni registros mineros al cortijo. |
| Alternativa | Georreferenciación con documentación catastral, ortofoto histórica o trabajo de campo. |
| Estado | `cortijoLocation.status: UNVERIFIED`. |

### 5. Repositorios externos no inspeccionados

| Campo | Valor |
|---|---|
| Bloqueo | NOT_INSPECTED |
| Causa | No se ha accedido a las estructuras reales de firecycle-ai, GEOOBS-AI, GODEYE ni atiende-ai durante esta fase. |
| Impacto | La matriz de integración lista funciones como `UNVERIFIED_IN_REPO`. |
| Alternativa | Inspección directa de los repositorios en fase posterior. |
| Estado | No se inventan rutas ni funciones. |

### 6. Servicios adicionales IGME no verificados

| Campo | Valor |
|---|---|
| Bloqueo | NOT_QUERIED |
| Causa | BDMIN Explotaciones, Inventario de Escombreras y GEODE no han sido consultados. |
| Impacto | No se cruzan datos con estas fuentes. |
| Alternativa | Verificar disponibilidad y esquema de cada servicio. |
| Estado | No se asume disponibilidad. |

## Principio rector

**Ningún bloqueo externo se convierte en simulación presentada como éxito.**

Cada bloqueo se documenta con:
- Causa técnica
- Impacto en la misión
- Alternativa propuesta
- Estado honesto (BLOCKED_RUNTIME, BLOCKED_EXTERNAL, UNVERIFIED, NOT_QUERIED)

La aplicación continúa funcional en todos los casos, mostrando datos ausentes como `null` o estados vacíos, nunca como valores inventados.
