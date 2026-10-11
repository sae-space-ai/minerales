# INTEGRACION_IGME.md — MINERAL-01 FASE 2

## Módulo de consulta IGME

### Ubicación

`src/lib/igmeClient.ts`

### Endpoint

```
https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query
```

### Parámetros de consulta

```
geometry={"xmin":...,"ymin":...,"xmax":...,"ymax":...,"spatialReference":{"wkid":25829}}
geometryType=esriGeometryEnvelope
inSR=25829
spatialRel=esriSpatialRelIntersects
outFields=*
outSR=4326
f=json
```

### Estados de respuesta

| Estado | Significado |
|---|---|
| NOT_QUERIED | No se ha ejecutado la consulta |
| QUERY_SUCCESS | Respuesta válida con registros |
| QUERY_EMPTY | Respuesta válida sin registros (área sin indicios) |
| QUERY_FAILED | Error de red, CORS, HTTP no 200, o error IGME |
| QUERY_PARTIAL | Respuesta incompleta (paginación no terminada) |
| QUERY_UNSUPPORTED | Servicio no disponible o esquema desconocido |

### Limitación CORS

La consulta directa desde el navegador falla por política CORS del servidor IGME.

**Soluciones implementadas:**
1. Intento de consulta directa (falla con CORS).
2. Fallback a proxy allorigins.win (solo desarrollo, no producción).

**Solución requerida para producción:**
- Proxy del lado servidor (Node.js, serverless function).
- No exponer secretos ni permitir consultas arbitrarias.

### Regla de oro

Si la consulta falla, `totalFeatures = null`. **Nunca se devuelve 0** cuando la consulta no ha tenido éxito.

### Campos de respuesta IGME (esperados)

| Campo | Descripción |
|---|---|
| OBJECTID | Identificador único |
| NOMBRE | Nombre del indicimiento |
| TIPO | Tipo de mineral/explotación |
| MINERAL | Mineral principal |
| ESTADO | Estado de la explotación |
| geometry.x, geometry.y | Coordenadas |

*Nota: los nombres exactos de campos deben verificarse con una respuesta real.*

### Registro de auditoría

Cada consulta registra:
- Timestamp exacto
- URL completa de la consulta
- CRS de entrada y salida
- Estado HTTP
- Estado de la respuesta
- Mensaje de error (si aplica)
- Clasificación del dato (OFFICIAL / FAILED)

### Fuentes adicionales pendientes

| Fuente | Estado |
|---|---|
| IGME BDMIN Explotaciones | NOT_QUERIED |
| IGME Inventario de Escombreras | NOT_QUERIED |
| GEODE cartografía geológica | NOT_QUERIED |
| Catastro derechos mineros | NOT_QUERIED |

Ninguna de estas fuentes se ha consultado. No se asume disponibilidad.
