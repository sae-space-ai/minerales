# MINERAL_EARTH_3D_ARCHITECTURE.md

## Arquitectura MINERAL EARTH 3D

### Componentes

```
MINERAL-01
├── Visor 2D (Leaflet) — src/components/MapView.tsx
│   └── Capas: anomalías, huecos, área, IGME
│
├── Visor 3D (CesiumJS) — src/components/Globe3D.tsx [LAZY]
│   ├── Capas base: OSM, ESRI, CARTO
│   ├── WMS: EUMETSAT, IGN PNOA, IGN Base, IGME Geología
│   ├── Terreno: Elipsoide (default) / Cesium World (con token)
│   └── Herramientas: búsqueda, flyTo, control de capas
│
└── Estado unificado — src/lib/store.ts
    └── Compartido entre ambos visores
```

### Carga diferida

CesiumJS (4.9 MB) se carga mediante `React.lazy()` + `Suspense` solo cuando el usuario accede a la pestaña GLOBO 3D. El bundle inicial permanece ligero.

### Interoperabilidad

- **Leaflet ↔ CesiumJS**: comparten estado de misión
- **Coordenadas**: WGS84 (EPSG:4326) como formato común
- **Capas**: adaptadores para cada motor
- **Cámara**: posición sincronizable entre visores

### Proveedores de datos

| Categoría | Proveedor | Estado |
|---|---|---|
| Base imagery | ESRI World Imagery | ✅ OPERATIONAL |
| Satélite | EUMETSAT WMS | ✅ OPERATIONAL |
| Ortofoto | IGN PNOA WMS | ✅ OPERATIONAL |
| Topográfico | IGN Base WMS | ✅ OPERATIONAL |
| Geología | IGME GEODE WMS | ✅ OPERATIONAL |
| Terreno 3D | Elipsoide (sin relieve) | ✅ OPERATIONAL |
| Terreno 3D premium | Cesium World Terrain | ⚠️ AUTHORIZATION_REQUIRED |

### Seguridad

- Sin tokens en código fuente
- CDN público para assets de CesiumJS
- Servicios WMS sin autenticación
- Validación de URLs (whitelist)

### Rendimiento

- CesiumJS cargado bajo demanda
- WebGL con fallback a Leaflet
- Control de memoria al desmontar viewer
- Destrucción limpia de recursos
