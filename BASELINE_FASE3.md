# BASELINE_FASE3.md — MINERAL-01

## Estado inicial Fase 3

**Fecha:** 2026-01-15
**Rama:** mineral-01-geospatial-mission-95a57
**Estado post-Fase 2:** PARTIAL

## Estado de capacidades al inicio de Fase 3

### Operativas (Fase 2)
- ✅ Lectura de cabecera LAS 1.4 (src/lib/lasReader.ts)
- ✅ Transformación UTM 29N/30N ↔ WGS84 (src/lib/coordinates.ts)
- ✅ Visor Leaflet con 4 capas funcionales
- ✅ Cliente IGME con fallback proxy CORS
- ✅ Exportación GeoJSON y CSV con sanitización
- ✅ Estado unificado con clasificación de datos
- ✅ Separación DEMO_SYNTHETIC / REAL

### Bloqueadas al inicio de Fase 3
- ⏳ Descompresión LAZ → BLOCKED_RUNTIME
- ⏳ Clasificación Ground → BLOCKED
- ⏳ MDT real → BLOCKED_EXTERNAL
- ⏳ Hillshade/pendiente/curvatura → BLOCKED
- ⏳ Detección geomorfológica → BLOCKED
- ⏳ Consulta IGME directa → BLOCKED_EXTERNAL (CORS)
- ⏳ Exportación PDF → BLOCKED
- ⏳ Motor IA → NOT_IMPLEMENTED
- ⏳ Integración FIRECYCLE/GEOOBS-AI/GODEYE → NOT_INSPECTED

## Archivos existentes

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── lib/
│   ├── coordinates.ts
│   ├── igmeClient.ts
│   ├── lasReader.ts
│   └── store.ts
└── components/
    ├── AnomalyPanel.tsx
    ├── Dashboard.tsx
    ├── DocumentationPanel.tsx
    ├── ExportPanel.tsx
    ├── IntegrationMatrixView.tsx
    ├── MapView.tsx
    └── MissionProvider.tsx
```

## Build de referencia
- `npm run build`: ✅ PASS (370.03 kB JS / 29.83 kB CSS)
- 1369 módulos transformados

## Nuevas dependencias instaladas para Fase 3
- laz-perf (descompresión LAZ en navegador vía WASM)
- geotiff (lectura GeoTIFF/COG)
- jspdf + jspdf-autotable (generación PDF)

## Estrategia Fase 3
1. Desbloquear LAZ real con laz-perf
2. Desbloquear MDT con geotiff
3. Implementar hillshade/pendiente/curvatura reales
4. Implementar detección geomorfológica
5. Implementar motor IA determinista
6. Implementar PDF real
7. Documentar bloqueos externos inevitables
8. Validación extremo a extremo
