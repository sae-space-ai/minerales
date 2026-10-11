# IMPLEMENTACION_LIDAR_MDT.md — MINERAL-01 FASE 2

## Módulo de ingesta LiDAR

### Ubicación

`src/lib/lasReader.ts`

### Capacidades implementadas

1. **Lectura de cabecera LAS 1.0 — 1.4** desde ArrayBuffer en el navegador.
2. **Verificación de firma LASF** (4 bytes).
3. **Extracción de metadatos**:
   - Versión major/minor
   - System identifier (32 bytes)
   - Generating software (32 bytes)
   - Fecha de creación (día del año, año)
   - Tamaño de cabecera
   - Offset a datos de puntos
   - Número de VLRs
   - Formato de punto
   - Longitud de registro de punto
   - Número legado de puntos (uint32)
   - Número de puntos por retorno (5 × uint32)
   - Escalas X, Y, Z (float64)
   - Offsets X, Y, Z (float64)
   - Extensión min/max X, Y, Z (float64)
   - LAS 1.4: número real de puntos (uint64 → 2 × uint32)
   - LAS 1.4: puntos por retorno (15 × uint64)
4. **Cálculo de SHA-256** del archivo completo mediante Web Crypto API.
5. **Cálculo de densidad de puntos** (puntos/m²) a partir de cabecera.
6. **Detección de compresión** por extensión de archivo (.laz).

### Capacidades NO implementadas (bloqueadas)

1. **Descompresión LAZ**: requiere laz-perf (C++ compilado a WASM) o similar.
2. **Lectura de puntos individuales**: bloqueada por compresión LAZ.
3. **Clasificación Ground (class 2)**: requiere puntos descomprimidos.
4. **Parseo de VLRs GeoTIFF para CRS**: implementación simplificada, devuelve null.

### Flujo de uso

```
Usuario → carga archivo .las/.laz
  → FileReader → ArrayBuffer
  → readLASHeader(buffer, filename)
  → computeSHA256(buffer)
  → computePointDensity(header)
  → Actualiza MissionState.lasFile
```

### Estados posibles

| Estado | Significado |
|---|---|
| NOT_STARTED | Sin archivo cargado |
| IN_PROGRESS | Leyendo cabecera |
| HEADER_ONLY | Cabecera leída, puntos no descomprimidos |
| BLOCKED_RUNTIME | LAZ comprimido, no se puede descomprimir en navegador |
| COMPLETED | Puntos procesados (requiere servidor) |
| FAILED | Error de parseo |

## Módulo MDT

### Estado actual

**NO IMPLEMENTADO** en esta fase.

### Requisitos para implementación

1. Descarga de GeoTIFF oficial del IGN-CNIG.
2. Parseo de GeoTIFF en el navegador (requiere geotiff.js o similar).
3. Reproyección si el CRS no es el de visualización.
4. Generación de hillshade (algoritmo de Horn o Zevenbergen-Thorne).
5. Generación de mapa de pendiente.
6. Generación de curvatura.
7. Detección de depresiones, zanjas, escombreras y cortes.

### Alternativa

Importación manual de MDT GeoTIFF por el usuario, con visualización en el visor Leaflet mediante canvas overlay.

### Dependencias necesarias

- `geotiff.js` para parseo de GeoTIFF en navegador.
- Algoritmos de procesamiento raster (hillshade, pendiente).
- O bien: servicio externo que genere COG y lo sirva vía WMTS/TMS.

## Transformación de coordenadas

### Ubicación

`src/lib/coordinates.ts`

### Capacidades

1. **UTM → WGS84**: fórmulas de Snyder (USGS PP 1395), elipsoide GRS80.
2. **WGS84 → UTM**: inversa de la anterior.
3. **Bounds UTM → WGS84**: transformación de bounding box.
4. **Distancia Haversine**: entre puntos WGS84.
5. **Prueba de ida y vuelta**: error < 1 m en Península Ibérica.

### Husos soportados

- EPSG:25829 (UTM 29N, meridiano central -9°)
- EPSG:25830 (UTM 30N, meridiano central -3°)

### Limitaciones

- No soporta otros husos UTM ni otras proyecciones.
- Para soporte completo se requeriría proj4js.
- La tolerancia es suficiente para visualización (< 1 m) pero no para topografía de precisión.
