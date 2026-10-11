# BASELINE_FASE2.md — MINERAL-01

## Estado inicial antes de la Fase 2

**Fecha de captura:** 2026-01-15
**Rama de referencia:** mineral-01-geospatial-mission-95a57
**Entorno:** Vite 6.3.5 + React 18.2.0 + Tailwind 4.1.7 + TypeScript 5.7.0

## Archivos inspeccionados

```
src/
├── App.tsx                              (navegación de 6 pestañas)
├── main.tsx                             (entry point)
├── index.css                            (estilos + overrides Leaflet)
├── types/index.ts                       (tipos compartidos)
├── data/missionData.ts                  (datos de misión — AUDITADO, ver abajo)
└── components/
    ├── Dashboard.tsx                    (panel de estado)
    ├── MapView.tsx                      (visor Leaflet)
    ├── AnomalyPanel.tsx                 (lista de anomalías)
    ├── IntegrationMatrixView.tsx        (matriz FIRECYCLE/GEOOBS-AI)
    ├── ExportPanel.tsx                  (GeoJSON/CSV/PDF)
    └── DocumentationPanel.tsx           (instrucciones + invariantes)
```

## Resultados de referencia (pre-Fase 2)

- `npm run build`: ✅ OK (346.74 kB JS / 26.72 kB CSS)
- `npm run typecheck`: ✅ OK (sin errores)
- `npm ci`: ✅ OK

## Problemas identificados en el baseline

### 1. Datos ficticios presentados como reales (src/data/missionData.ts)

| Campo | Valor actual | Problema |
|---|---|---|
| `AREA_CENTER` | `[38.0833, -5.7167]` | No acreditado como ubicación del Cortijo de Daniela |
| `lasStatus.filename` | `PNOA_LIDAR_Montemolin_2020.laz` | No coincide con el archivo real verificado |
| `lasStatus.crsEPSG` | `EPSG:25830` | El archivo real es EPSG:25829 (UTM 29N) |
| `lasStatus.minX/maxX` | `612340 / 614560` | No corresponden a la cabecera comprobada |
| `lasStatus.pointCount` | `48_732_410` | El archivo real declara 6.040.166 |
| `lasStatus.checksumSHA256` | `a7f3c9e2...` | Huella inventada |
| `anomalies[0-1]` | geometrías, dimensiones, confianza | Precargadas sin procesamiento real |
| `coverageGaps[0-1]` | polígonos estáticos | No derivados de datos reales |
| `geomorphologicalEvaluation` | conteos (3, 1, 0, 0) | No calculados sobre MDT real |
| `integrationMatrix` | rutas y funciones | No verificadas en repositorios reales |
| `test results` | booleanos constantes | No derivados de ejecución real |

### 2. Visor Leaflet

- Las capas se dibujan todas al montar; los toggles del header no las controlan realmente.
- Se muestra "CRS: ETRS89 / UTM 30N" como etiqueta fija, aunque Leaflet usa EPSG:3857 internamente.
- No hay diferenciación entre modo DEMO y modo REAL.

### 3. Exportaciones

- CSV no escapa comillas ni protege contra inyección de fórmulas (`=`, `+`, `-`, `@` al inicio).
- PDF se muestra como "requiere servidor" pero no hay servidor.

### 4. Consulta IGME

- Estado `QUERY_FAILED` con mensaje honesto sobre CORS — correcto.
- Pero `totalFeatures: null` se muestra junto a datos ficticios de anomalías, lo que genera contradicción.

### 5. Matriz de integración

- Lista funciones de `pergolessi9-star/firecycle-ai` y `sae-space-ai/GEOOBS-AI` sin haber inspeccionado los repositorios reales.
- Incluye también `sae-space-ai/GODEYE` y `sae-space-ai/atiende-ai` que no aparecen en la matriz actual.

## Punto de recuperación

- Los archivos originales se conservan en la rama `mineral-01-geospatial-mission-95a57`.
- Esta Fase 2 trabaja sobre los mismos archivos, reemplazando solo datos y lógica afectados.
- La interfaz (6 pestañas, navegación, tarjetas, diseño) se conserva íntegra.

## Estrategia de la Fase 2

1. **Separar** `DEMO_SYNTHETIC` de `REAL` en todos los proveedores de datos.
2. **Corregir CRS** a EPSG:25829 (archivo real) e implementar transformación a WGS84.
3. **Implementar** parser real de cabecera LAS en el navegador.
4. **Implementar** cargador de archivos (drag & drop / file input) para LAZ/LAS.
5. **Reparar** visor Leaflet para que las capas respondan a los toggles.
6. **Añadir** cliente IGME con proxy CORS (fallback a `QUERY_FAILED` honesto).
7. **Corregir** exportación CSV con sanitización.
8. **Documentar** bloqueos externos sin simularlos como éxitos.

## Resultado global esperado

**PARTIAL** — la aplicación continúa funcional, los datos ficticios se etiquetan como tales, el CRS es correcto, el parser LAS lee cabeceras reales, las capas del visor responden a los toggles, pero el procesamiento completo de LAZ/MDT y la consulta IGME desde el navegador permanecen bloqueados por limitaciones técnicas externas (CORS, necesidad de backend para LAZ descompresión).
