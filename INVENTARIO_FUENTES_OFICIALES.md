# INVENTARIO_FUENTES_OFICIALES.md — MINERAL-01 FASE 2

## Fuentes oficiales identificadas

### 1. PNOA LiDAR (Plan Nacional de Ortofotografía Aérea)

| Campo | Valor |
|---|---|
| Fuente | CNIG — Centro Nacional de Información Geográfica |
| URL | https://centrodedescargas.cnig.es/ |
| Archivo real | PNOA_2024_AND_757-4211_H29_NPC01.laz |
| CRS | EPSG:25829 (ETRS89 / UTM 29N) |
| Versión LAS | 1.4 |
| Formato de punto | 8 |
| Puntos declarados | 6.040.166 |
| Extensión X | 757000 — 758000 |
| Extensión Y | 4210000 — 4210815.65 |
| Estado | Archivo aportado, cabecera verificada, descompresión pendiente |
| Clasificación | SOURCE_VERIFIED (cabecera) / BLOCKED (puntos) |

### 2. MDT del IGN-CNIG

| Campo | Valor |
|---|---|
| Fuente | IGN — Instituto Geográfico Nacional |
| URL | https://centrodedescargas.cnig.es/ |
| Resolución objetivo | 5 m (MDT5) o 0.5 m (MDT0.5 si disponible) |
| Formato | GeoTIFF, preferiblemente COG |
| CRS esperado | EPSG:25829 o EPSG:4258 |
| Estado | SOURCE_UNAVAILABLE — no descargado en esta fase |
| Clasificación | PENDING |

### 3. IGME BDMIN Indicios

| Campo | Valor |
|---|---|
| Fuente | IGME — Instituto Geológico y Minero de España |
| Endpoint | https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query |
| Protocolo | ArcGIS REST API |
| CRS soportado | Múltiples (WKID) |
| Estado | QUERY_FAILED — CORS bloquea consulta directa desde navegador |
| Clasificación | FAILED |

### 4. IGME BDMIN Explotaciones

| Campo | Valor |
|---|---|
| Fuente | IGME |
| Endpoint | Por verificar |
| Estado | NOT_QUERIED |
| Clasificación | PENDING |

### 5. IGME Inventario de Escombreras

| Campo | Valor |
|---|---|
| Fuente | IGME |
| Disponibilidad | No verificada |
| Estado | NOT_QUERIED |
| Clasificación | PENDING |

### 6. GEODE (Cartografía Geológica)

| Campo | Valor |
|---|---|
| Fuente | IGME |
| URL | Por verificar |
| Estado | NOT_QUERIED |
| Clasificación | PENDING |

### 7. Catastro de Derechos Mineros

| Campo | Valor |
|---|---|
| Fuente | Ministerio de Hacienda / Catastro |
| Advertencia | Los límites catastrales NO acreditan titularidad minera |
| Estado | NOT_QUERIED |
| Clasificación | PENDING |

## Fuentes NO oficiales utilizadas

| Fuente | Uso | Clasificación |
|---|---|---|
| OpenStreetMap | Tiles de visualización en Leaflet | Referencia visual, no científica |
| allorigins.win | Proxy CORS para IGME | Solo desarrollo, no producción |

## Principio rector

Ninguna fuente se marca como verificada sin haber obtenido una respuesta real y documentada.
Las fuentes no consultadas se marcan como `NOT_QUERIED` o `PENDING`, nunca como `QUERY_EMPTY`.
