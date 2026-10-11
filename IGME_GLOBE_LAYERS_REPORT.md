# IGME_GLOBE_LAYERS_REPORT.md

## Capas IGME en MINERAL EARTH 3D — Fase 4

### Servicios WMS integrados

| Servicio | URL | Capas | Estado |
|---|---|---|---|
| GEODE (Geología) | mapas.igme.es/.../Cartografia_GEODE/MapServer/WMSServer | 0 (MAGNA 50) | ✅ OPERATIONAL |
| BDMIN Indicios | mapas.igme.es/.../IGME_BDMIN_Indicios/MapServer/0/query | REST | ⚠️ CORS_BLOCKED |
| BDMIN Explotaciones | Por verificar | REST | ⚠️ NOT_QUERIED |
| Escombreras | Por verificar | REST | ⚠️ NOT_QUERIED |

### Integración en CesiumJS

```typescript
const igme = new Cesium.WebMapServiceImageryProvider({
  url: 'https://mapas.igme.es/gis/services/Cartografia_GEODE/MapServer/WMSServer',
  layers: '0',
  parameters: { transparent: true, format: 'image/png' },
});
```

### Registros IGME como entidades

Cuando la consulta REST funcione (proxy servidor), los registros se visualizarán como:
- Billboards con iconos según tipo de indicimiento
- Popups con ficha descriptiva
- Enlace a fuente original
- Distancia al área de estudio

### Limitaciones

- Consulta REST bloqueada por CORS desde navegador
- Requiere proxy servidor para BDMIN
- GEODE WMS operativo sin autenticación
- No se deduce composición del subsuelo de imágenes satelitales

## Estado: PARTIAL (WMS GEODE operativo, REST pendiente de proxy)
