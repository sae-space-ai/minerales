# BASELINE_FASE4.md — MINERAL-01

## Estado inicial Fase 4

**Fecha:** 2026-01-15
**Rama:** mineral-01-geospatial-mission-95a57
**Estado post-Fase 3:** PASS (con bloqueos externos documentados)

## Auditoría de componentes existentes

### Módulos operativos confirmados
- ✅ Dashboard con carga LAZ/MDT
- ✅ Visor Leaflet con 4 capas funcionales
- ✅ Panel de anomalías con clasificación
- ✅ Panel MINERAL-AI (motor determinista)
- ✅ Matriz de integración
- ✅ Exportación GeoJSON/CSV/PDF
- ✅ Documentación
- ✅ Procesador LAZ con laz-perf
- ✅ Procesador MDT con geotiff.js
- ✅ Motor IA determinista
- ✅ Cliente IGME con fallback CORS

### Build de referencia (Fase 3)
- `npm run build`: ✅ PASS
- 1690 módulos transformados
- 821.77 kB JS principal + chunks dinámicos

## Nuevas dependencias instaladas para Fase 4
- cesium (motor 3D planetario)
- vite-plugin-cesium (gestión de assets)

## Estrategia Fase 4
1. Integrar CesiumJS con carga diferida (lazy import)
2. Añadir pestaña "GLOBO 3D" sin eliminar las 7 existentes
3. Conectar servicios WMS/WMTS oficiales (EUMETSAT, IGN)
4. Implementar navegación planetaria
5. Integrar con MINERAL-AI para navegación por texto
6. Documentar bloqueos externos (credenciales Cesium ion, etc.)
7. Mantener Leaflet intacto como visor 2D
8. Validación extremo a extremo

## Bloqueos externos previsibles
- Cesium ion token (requiere cuenta) → usar fuentes abiertas
- EUMETSAT Data Store API (requiere autenticación) → usar EUMETView WMS público
- IGN terrain 3D (no disponible directamente) → usar MDT + ortofoto
- GODEYE repo no inspeccionado → integración pendiente
