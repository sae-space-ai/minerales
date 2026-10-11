# MATRIZ_FUNCIONAL_MINERAL01.md — FASE 2

## Funciones implementadas en sae-space-ai/minerales

### Módulos de lógica (src/lib/)

| Módulo | Función | Estado | Notas |
|---|---|---|---|
| `coordinates.ts` | `utmToWgs84(e, n, epsg)` | ✅ IMPLEMENTED | Snyder/GRS80 |
| `coordinates.ts` | `wgs84ToUtm(lat, lon, epsg)` | ✅ IMPLEMENTED | Inversa |
| `coordinates.ts` | `boundsUtmToWgs84(...)` | ✅ IMPLEMENTED | Bounding box |
| `coordinates.ts` | `pointsUtmToWgs84(...)` | ✅ IMPLEMENTED | Array de puntos |
| `coordinates.ts` | `haversineDistance(...)` | ✅ IMPLEMENTED | Distancia esférica |
| `coordinates.ts` | `roundTripError(...)` | ✅ IMPLEMENTED | Prueba ida/vuelta |
| `lasReader.ts` | `readLASHeader(buffer, filename)` | ✅ IMPLEMENTED | LAS 1.0-1.4 |
| `lasReader.ts` | `computeSHA256(buffer)` | ✅ IMPLEMENTED | Web Crypto |
| `lasReader.ts` | `computePointDensity(header)` | ✅ IMPLEMENTED | pt/m² |
| `igmeClient.ts` | `buildIGMEQueryURL(params)` | ✅ IMPLEMENTED | Construye URL |
| `igmeClient.ts` | `queryIGME(params)` | ✅ IMPLEMENTED | Consulta directa |
| `igmeClient.ts` | `queryIGMEViaProxy(params)` | ✅ IMPLEMENTED | Fallback proxy |
| `store.ts` | `MissionContext` | ✅ IMPLEMENTED | Estado unificado |
| `store.ts` | `useMission()` | ✅ IMPLEMENTED | Hook React |

### Componentes (src/components/)

| Componente | Función | Estado | Notas |
|---|---|---|---|
| `MissionProvider.tsx` | Proveedor de contexto | ✅ IMPLEMENTED | Gestiona estado global |
| `Dashboard.tsx` | Panel principal | ✅ IMPLEMENTED | Carga LAZ, consulta IGME |
| `MapView.tsx` | Visor Leaflet | ✅ IMPLEMENTED | Capas funcionales |
| `AnomalyPanel.tsx` | Lista de anomalías | ✅ IMPLEMENTED | Clasificación completa |
| `IntegrationMatrixView.tsx` | Matriz de integración | ✅ IMPLEMENTED | Solo funciones verificadas |
| `ExportPanel.tsx` | Exportación datos | ✅ IMPLEMENTED | GeoJSON + CSV seguros |
| `DocumentationPanel.tsx` | Documentación | ✅ IMPLEMENTED | Estado real |
| `App.tsx` | Navegación | ✅ IMPLEMENTED | 6 pestañas conservadas |

### Funciones bloqueadas

| Función | Bloqueo | Requiere |
|---|---|---|
| Descompresión LAZ | BLOCKED_RUNTIME | laz-perf en servidor |
| Clasificación Ground | BLOCKED | Descompresión LAZ |
| MDT real | BLOCKED_EXTERNAL | Descarga IGN-CNIG |
| Hillshade | BLOCKED | MDT real |
| Pendiente | BLOCKED | MDT real |
| Curvatura | BLOCKED | MDT real |
| Detección depresiones | BLOCKED | MDT real |
| Detección zanjas | BLOCKED | MDT real |
| Consulta IGME directa | BLOCKED_EXTERNAL | CORS / proxy servidor |
| Exportación PDF | BLOCKED | Servidor de renderizado |
| Cruce GEODE | NOT_QUERIED | Verificación servicio |
| Cruce escombreras | NOT_QUERIED | Verificación servicio |
| Ubicación Cortijo Daniela | UNVERIFIED | Cartografía oficial |

## Integración con ecosistema externo

| Repositorio | Estado | Notas |
|---|---|---|
| pergolessi9-star/firecycle-ai | NOT_INSPECTED | No se ha accedido al repo |
| sae-space-ai/GEOOBS-AI | NOT_INSPECTED | No se ha accedido al repo |
| sae-space-ai/GODEYE | NOT_INSPECTED | No se ha accedido al repo |
| sae-space-ai/atiende-ai | NOT_INSPECTED | No se ha accedido al repo |
| sae-space-ai/minerales | ACTIVE | Este proyecto |

MINERAL-01 conserva autonomía funcional. La integración con otros repositorios se realizará progresivamente tras verificar sus estructuras reales.
