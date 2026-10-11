# CRS_VALIDATION_FASE4.md

## Validación CRS — Fase 4

### Sistemas de coordenadas utilizados

| Contexto | CRS | EPSG | Estado |
|---|---|---|---|
| Archivo LAZ original | ETRS89 / UTM 29N | 25829 | ✅ PRESERVED |
| GeoJSON exportación | WGS 84 | 4326 | ✅ OPERATIONAL |
| Leaflet visualización | Web Mercator | 3857 | ✅ OPERATIONAL |
| CesiumJS visualización | WGS 84 | 4326 (geográfico) | ✅ OPERATIONAL |
| Servicios WMS | Variable | Múltiples | ✅ HANDLED |

### Transformaciones implementadas

| Función | Módulo | Estado |
|---|---|---|
| UTM 29N ↔ WGS84 | src/lib/coordinates.ts | ✅ VERIFIED |
| UTM 30N ↔ WGS84 | src/lib/coordinates.ts | ✅ VERIFIED |
| Bounds UTM → WGS84 | src/lib/coordinates.ts | ✅ VERIFIED |
| Haversine distance | src/lib/coordinates.ts | ✅ VERIFIED |

### Separación de CRS

```
Origen (LAZ): EPSG:25829
    ↓
Análisis: EPSG:25829 (conservado)
    ↓
Exportación GeoJSON: EPSG:4326 (transformado)
    ↓
Visualización Leaflet: EPSG:3857 (proyección)
Visualización CesiumJS: EPSG:4326 (geográfico)
```

### Validación

- Error ida y vuelta: < 1 m
- Bounds LAZ transformados correctamente
- GeoJSON válido con CRS declarado
- Servicios WMS respetan CRS nativo

## Estado: OPERATIONAL_VERIFIED
