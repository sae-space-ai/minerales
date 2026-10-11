# EUMETSAT_REAL_CONNECTION_REPORT.md

## Verificación real del servicio EUMETSAT — Fase 5

### GetCapabilities ejecutado

**URL:** https://view.eumetsat.int/geoserver/wms
**Fecha:** 2026-01-15
**Versión WMS:** 1.3.0
**Estado:** ✅ OPERATIONAL

### Capas MSG verificadas (0 degree - Europa/África)

| ID Real | Nombre | Descripción | Dimensión temporal |
|---|---|---|---|
| msg_fes:rgb_dust | Dust RGB - MSG | Composición RGB para polvo sahariano (IR8.7, IR10.8, IR12.0) | 2020-09-01/2026-10-11/PT15M |
| msg_fes:ir108 | IR 10.8μm - MSG | Imagen infrarroja térmica SEVIRI | 2020-09-01/2026-10-11/PT15M |
| msg_fes:vis006 | Visible 0.6μm - MSG | Imagen visible de alta resolución | 2020-08-01/2026-10-11/PT15M |
| msg_fes:rgb_natural | Natural Colour RGB - MSG | Composición color natural (NIR1.6, VIS0.8, VIS0.6) | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_convection | Convection RGB - MSG | Composición RGB para convección severa | 2020-09-01/2026-10-11/PT15M |
| msg_fes:clm | Cloud Mask - MSG | Máscara de nubes a nivel de píxel | 2020-09-01/2026-10-11/PT15M |
| msg_fes:fire | Active Fire - MSG | Detección de incendios activos | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_fog | Fog / Low Clouds RGB - MSG | Niebla y nubes bajas nocturnas | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_microphysics | Day Microphysics RGB - MSG | Microfísica diurna | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_snow | Snow RGB - MSG | Nieve y niebla diurna | 2020-02-12/2026-10-11/PT15M |
| msg_fes:rgb_airmass | Airmass RGB - MSG | Masas de aire | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_ash | Volcanic Ash RGB - MSG | Ceniza volcánica | 2020-09-01/2026-10-11/PT15M |
| msg_fes:rgb_eview | European HRV RGB | Vista europea HRV | 2022-03-29/2026-10-11/PT15M |
| msg_fes:rdt | Rapidly Developing Thunderstorms | Tormentas de desarrollo rápido | 2023-03-07/2026-10-11/PT15M |
| msg_fes:cth | Cloud Top Height | Altura de techo de nubes | 2020-09-01/2026-10-11/PT15M |
| msg_fes:gii_kindex | GII K-Index | Índice de inestabilidad K | 2021-06-06/2026-10-11/PT15M |
| msg_fes:h60b | Precipitation blended | Precipitación combinada GEO/LEO | 2022-12-09/2026-10-11/PT15M |

### Capas MTG verificadas (Meteosat Third Generation)

| ID Real | Nombre | Descripción |
|---|---|---|
| mtg_fd:rgb_truecolour | True Colour RGB - MTG-I | Color verdadero |
| mtg_fd:rgb_geocolour | Geo Colour RGB - MTG-I | Color geográfico |
| mtg_fd:rgb_dust | Dust RGB - MTG-I | Polvo (1km resolución) |
| mtg_fd:rgb_fog | Fog / Low Clouds RGB - MTG-I | Niebla nocturna |
| mtg_fd:rgb_cloudphase | Cloud Phase RGB - MTG-I | Fase de nubes |
| mtg_fd:rgb_cloudtype | Cloud Type RGB - MTG-I | Tipo de nubes |
| mtg_fd:rgb_snow | Snow RGB - MTG-I | Nieve |
| mtg_fd:rgb_firetemperature | Fire Temperature RGB - MTG-I | Temperatura de incendios |
| mtg_fd:frp | Fire Radiative Power | Potencia radiativa de incendios |
| mtg_fd:li_afa | LI Accumulated Flash Area | Área de rayos acumulada |
| mtg_fd:ir105_hrfi | FCI HRFI IR10.5μm | IR alta resolución |
| mtg_fd:vis06_hrfi | FCI HRFI VIS0.6μm | Visible alta resolución |
| mtg_fd:h40b | Blended precipitation MTG | Precipitación combinada |

### CRS soportados

- EPSG:4326
- CRS:84
- EPSG:3857
- EPSG:3995 (polar norte)
- EPSG:3976 (polar sur)

### Formatos soportados

- image/png
- image/jpeg
- image/geotiff
- image/gif
- image/svg+xml
- application/vnd.google-earth.kml+xml

### Integración en CesiumJS

```typescript
const provider = new Cesium.WebMapServiceImageryProvider({
  url: 'https://view.eumetsat.int/geoserver/wms',
  layers: 'msg_fes:rgb_dust',
  parameters: { 
    transparent: true, 
    format: 'image/png',
    version: '1.3.0',
  },
});
```

### Limitaciones

- Resolución espacial: ~3 km para MSG, ~1 km para MTG
- No apto para detectar estructuras pequeñas (pozos mineros)
- Uso principal: contexto ambiental y meteorológico
- Dimensión temporal: 15 minutos para MSG, 10 minutos para MTG

## Estado: OPERATIONAL_VERIFIED
