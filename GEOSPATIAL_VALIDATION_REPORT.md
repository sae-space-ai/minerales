# GEOSPATIAL_VALIDATION_REPORT.md

## Validación geoespacial — Fase 3

### Sistemas de coordenadas

| CRS | EPSG | Uso | Estado |
|---|---|---|---|
| ETRS89 / UTM 29N | 25829 | Original del archivo LAZ | ✅ OPERATIONAL |
| ETRS89 / UTM 30N | 25830 | Procesamiento alternativo | ✅ OPERATIONAL |
| WGS 84 | 4326 | GeoJSON, Leaflet | ✅ OPERATIONAL |
| Web Mercator | 3857 | Visualización Leaflet | ✅ OPERATIONAL |

### Transformaciones implementadas

| Función | Módulo | Estado |
|---|---|---|
| utmToWgs84 | src/lib/coordinates.ts | ✅ VERIFIED |
| wgs84ToUtm | src/lib/coordinates.ts | ✅ VERIFIED |
| boundsUtmToWgs84 | src/lib/coordinates.ts | ✅ VERIFIED |
| pointsUtmToWgs84 | src/lib/coordinates.ts | ✅ VERIFIED |
| haversineDistance | src/lib/coordinates.ts | ✅ VERIFIED |
| roundTripError | src/lib/coordinates.ts | ✅ VERIFIED |

### Tolerancias

- Error de ida y vuelta: < 1 m en Península Ibérica
- Elipsoide: GRS80 (equivalente a WGS84 para esta precisión)
- Fórmulas: Snyder (USGS Professional Paper 1395)

### Bounds del archivo LAZ transformados

```
UTM 29N (EPSG:25829):
  SW: (757000, 4210000)
  NE: (758000, 4210815.65)

WGS84 (EPSG:4326):
  SW: ≈ (-6.197, 38.030)
  NE: ≈ (-6.185, 38.037)
```

### Separación de CRS

| Contexto | CRS |
|---|---|
| Origen (archivo LAZ) | EPSG:25829 |
| Análisis | EPSG:25829 o 25830 |
| Visualización (Leaflet) | EPSG:3857 |
| Exportación (GeoJSON) | EPSG:4326 |

### Ubicación del Cortijo de Daniela

**Estado:** UNVERIFIED
**Nota:** No se asignan coordenadas sin fuente cartográfica oficial.

### Referencia del arroyo de Matarrama

**Coordenadas:** 38.01250, -6.06628 (WGS84)
**Estado:** PROVISIONAL
**Nota:** Punto de referencia provisional, no ubicación del cortijo.

## Estado: OPERATIONAL_VERIFIED
