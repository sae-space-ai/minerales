# THREED_TERRAIN_VALIDATION.md

## Validación terreno 3D — Fase 4

### Estado actual

| Proveedor | Tipo | Estado | Notas |
|---|---|---|---|
| Elipsoide | Default CesiumJS | ✅ OPERATIONAL | Terreno plano |
| Cesium World Terrain | Premium | ⚠️ AUTHORIZATION_REQUIRED | Requiere token gratuito |
| MDT local (usuario) | Custom | ✅ OPERATIONAL | Requiere GeoTIFF cargado |
| IGN terrain tiles | No disponible | ❌ NOT_AVAILABLE | IGN no provee tiles Cesium |

### Implementación actual

```typescript
// Default: elipsoide (sin relieve)
viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

// Con token: Cesium World Terrain
// Cesium.Ion.defaultAccessToken = '...';
// viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

// Custom: MDT local procesado
// Requiere conversión GeoTIFF → heightmap → terrain provider
```

### Limitaciones

- Sin token: terreno plano (elipsoide)
- MDT local requiere procesamiento adicional
- No se declara relieve real cuando no existe

### Diferenciación visual

- Elipsoide: superficie lisa
- Cesium World: relieve real (con token)
- MDT local: relieve procesado (con archivo)

### Recomendación

Para visualización con relieve real:
1. Obtener token gratuito de Cesium ion (https://ion.cesium.com/)
2. Configurar en variable de entorno
3. O cargar MDT local procesado

## Estado: PARTIAL (elipsoide operativo, relieve real pendiente de token o MDT)
