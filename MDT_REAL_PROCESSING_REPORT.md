# MDT_REAL_PROCESSING_REPORT.md

## Motor MDT real — Fase 3

### Implementación

**Módulo:** `src/lib/mdtProcessor.ts`
**Dependencia:** `geotiff` (geotiff.js)
**Estado:** OPERATIONAL_VERIFIED

### Capacidades desbloqueadas

1. ✅ Carga de archivos GeoTIFF
2. ✅ Soporte para COG (Cloud Optimized GeoTIFF)
3. ✅ Detección de CRS desde GeoKeys
4. ✅ Extracción de NoData
5. ✅ Cálculo de resolución espacial
6. ✅ Bounds geográficos
7. ✅ Hillshade multi-azimut
8. ✅ Mapa de pendiente
9. ✅ Curvatura (Laplaciana)
10. ✅ Detección de depresiones
11. ✅ Detección de estructuras lineales

### Flujo de procesamiento

```
Usuario → carga GeoTIFF
  → FileReader → ArrayBuffer
  → geotiff.fromArrayBuffer()
  → getImage() → readRasters()
  → Extraer banda 0
  → Detectar CRS, NoData, bounds
  → Actualización de estado
```

### Algoritmos implementados

| Algoritmo | Método | Referencia |
|---|---|---|
| Hillshade | Gradiente de Horn | Burrough & McDonnell 1998 |
| Pendiente | Gradiente central | Snyder 1991 |
| Curvatura | Laplaciana | Zevenbergen & Thorne 1987 |
| Depresiones | Mínimos locales + flood fill | Propio |
| Lineales | Análisis de gradientes + umbralización | Propio |

### Umbrales configurables

| Parámetro | Valor por defecto |
|---|---|
| minDepth (depresiones) | 1.5 m |
| minArea (depresiones) | 25 m² |
| minDepth (lineales) | 1.0 m |
| minLength (lineales) | 20 m |
| azimuth (hillshade) | 315° |
| altitude (hillshade) | 45° |

### Fuentes oficiales compatibles

- MDT5 del IGN-CNIG (5 m)
- MDT0.5 de Extremadura (0.5 m, provisional)
- Cualquier GeoTIFF con elevación en metros

### Limitaciones

- No reproyecta automáticamente entre CRS
- Requiere que el usuario descargue el GeoTIFF oficial
- Detección de lineales simplificada (no usa Hough)

## Estado: OPERATIONAL_VERIFIED
