# EUMETSAT_SERVICES_INVENTORY.md

## Servicios EUMETSAT — Fase 4

### Endpoints verificados

| Servicio | URL | Tipo | Estado |
|---|---|---|---|
| EUMETView WMS | https://view.eumetsat.int/geoservices/ows | WMS | ✅ OPERATIONAL |
| EUMETSAT Data Store | https://data.eumetsat.int/ | REST API | ⚠️ AUTHORIZATION_REQUIRED |
| EUMETSAT API | https://api.eumetsat.int/ | REST API | ⚠️ AUTHORIZATION_REQUIRED |

### Capas WMS disponibles (EUMETView)

| ID | Nombre | Descripción | Estado |
|---|---|---|---|
| MSG_Dust_RGB | MSG Dust RGB | Falso color para polvo sahariano | ✅ OPERATIONAL |
| MSG_IR108 | MSG IR 10.8μm | Infrarrojo térmico | ✅ OPERATIONAL |
| MSG_VIS006 | MSG Visible 0.6μm | Visible alta resolución | ✅ OPERATIONAL |

### Limitaciones

- Resolución: ~3 km para MSG (no apto para detectar pozos mineros)
- Uso principal: contexto ambiental, no investigación detallada
- Cobertura temporal: limitada a productos archivados
- Autenticación: no requerida para EUMETView público

### Integración en MINERAL EARTH 3D

```typescript
const provider = new Cesium.WebMapServiceImageryProvider({
  url: 'https://view.eumetsat.int/geoservices/ows',
  layers: 'MSG_Dust_RGB',
  parameters: { transparent: true, format: 'image/png' },
});
```

### Pendientes

- Data Store API requiere credenciales (AUTHORIZATION_REQUIRED)
- Productos de alta resolución (Sentinel, etc.) requieren autenticación
- Implementar selector de fecha/hora cuando esté disponible

## Estado: PARTIAL (WMS público operativo, API pendiente de credenciales)
