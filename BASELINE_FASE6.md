# BASELINE_FASE6.md — MINERAL-01

## Estado inicial Fase 6

**Fecha:** 2026-01-15
**Rama:** mineral-01-geospatial-mission-95a57
**Estado post-Fase 5:** PARTIAL

## Auditoría de módulos existentes

### Módulos operativos preservados
- ✅ Dashboard (carga LAZ/MDT)
- ✅ Visor Leaflet 2D (4 capas)
- ✅ Visor CesiumJS 3D (GLOBO 3D)
- ✅ Panel de anomalías
- ✅ MINERAL-AI (motor determinista)
- ✅ Matriz de integración
- ✅ Exportaciones GeoJSON/CSV/PDF
- ✅ Documentación
- ✅ Procesadores LiDAR/MDT
- ✅ Estado unificado

### Build de referencia (Fase 5)
- `npm run build`: ✅ PASS (3320 módulos, 42.85s)
- CesiumJS: 4.9 MB (lazy loaded)

## Bloqueos heredados que afectan MicroView

| Bloqueo | Impacto en MicroView |
|---|---|
| Relieve 3D real (token Cesium ion) | Vista 3D limitada a elipsoide |
| IGME CORS | No se pueden consultar registros para microcelda |
| Herramientas medición 3D | No implementadas aún |
| Verificación IGN/IGME | Nombres de capas no validados |

## Estrategia Fase 6
1. Crear módulo de microceldas con geometría UTM correcta
2. Implementar componente MicroView con visor sincronizado
3. Añadir pestaña MICROVIEW 1M² sin alterar las 8 existentes
4. Integrar con estado unificado
5. Indicadores de resolución real (no inventados)
6. Documentar limitaciones de fuentes
7. Build y validación

## Fuentes disponibles para microceldas

| Fuente | Resolución | Estado para 1m² |
|---|---|---|
| PNOA Ortofoto | 0.25-0.5m | ✅ ADECUADA |
| Sentinel-2 | 10m | ❌ INSUFICIENTE |
| EUMETSAT MSG | 3km | ❌ INSUFICIENTE |
| LiDAR PNOA | Variable | ✅ ADECUADA (si archivo cargado) |
| MDT5 IGN | 5m | ⚠️ LIMITADA |
| MDT0.5 Extremadura | 0.5m | ✅ ADECUADA (si disponible) |
| GEODE | Variable | ⚠️ CONTEXTUAL |
