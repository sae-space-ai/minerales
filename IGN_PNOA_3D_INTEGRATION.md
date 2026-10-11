# IGN_PNOA_3D_INTEGRATION.md

## Integración IGN-PNOA — Fase 4

### Servicios WMS/WMTS operativos

| Servicio | URL | Capas | Estado |
|---|---|---|---|
| PNOA Ortofoto | ign.es/wms-inspire/pnoa-ma | OI.OrthoimageCoverage | ✅ OPERATIONAL |
| Mapa Raster | ign.es/wms-inspire/mapa-raster | mtn_raster | ✅ OPERATIONAL |
| MDT5 | ign.es/wcs/MDT5_PENINSULA | Coverage MDT | ✅ OPERATIONAL (WCS) |
| LiDAR | centrodedescargas.cnig.es | LAZ por teselas | ⚠️ MANUAL_DOWNLOAD |

### Integración en CesiumJS

```typescript
// Ortofoto PNOA
const pnoa = new Cesium.WebMapServiceImageryProvider({
  url: 'https://www.ign.es/wms-inspire/pnoa-ma',
  layers: 'OI.OrthoimageCoverage',
});

// Mapa topográfico
const mapa = new Cesium.WebMapServiceImageryProvider({
  url: 'https://www.ign.es/wms-inspire/mapa-raster',
  layers: 'mtn_raster',
});
```

### Terreno 3D

**Estado:** No disponible directamente como terrain provider compatible con CesiumJS.

**Alternativas:**
1. MDT5 vía WCS → conversión a heightmap → terrain provider custom
2. LiDAR PNOA → procesado con lazProcessor → DTM → terrain provider
3. Cesium World Terrain (requiere token gratuito de Cesium ion)

**Implementación actual:** Elipsoide (terreno plano). El usuario puede cargar MDT GeoTIFF para visualización 2D.

### Limitaciones

- IGN no provee terrain tiles compatibles con CesiumJS
- Conversión MDT → terrain requiere procesamiento adicional
- LiDAR requiere descarga manual y procesamiento local

## Estado: PARTIAL (WMS operativo, terrain 3D pendiente de conversión)
