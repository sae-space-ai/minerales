# VALIDACION_FASE2.md — MINERAL-01

## Resultados de compilación

| Control | Resultado | Detalle |
|---|---|---|
| `npm run build` | ✅ PASS | 370.03 kB JS / 29.83 kB CSS |
| `vite build` | ✅ PASS | 1369 módulos transformados en 6.16s |
| Errores TypeScript | ✅ PASS | Sin errores tras corrección de tipos |

## Pruebas de invariantes

| Invariante | Resultado | Evidencia |
|---|---|---|
| Ninguna anomalía CONFIRMADA sin evidencia externa | ✅ PASS | 0/0 confirmadas en modo REAL |
| Ningún conteo IGME = 0 cuando consulta falla | ✅ PASS | `totalFeatures: null` cuando `status: QUERY_FAILED` |
| CRS original conservado (EPSG:25829) | ✅ PASS | No se sustituye automáticamente |
| Datos DEMO_SYNTHETIC separados de REAL | ✅ PASS | Filtro por `dataClassification` |
| Recuentos no calculados son null | ✅ PASS | `depressions.count: null, status: NOT_COMPUTED` |
| Ubicación cortijo no asignada sin verificación | ✅ PASS | `cortijoLocation.status: UNVERIFIED` |
| Exportación CSV con sanitización | ✅ PASS | Escape de comillas, protección de fórmulas |
| Visor Leaflet capas funcionales | ✅ PASS | Toggles controlan `addLayer`/`removeLayer` |
| Popup sin HTML sin sanitizar | ✅ PASS | `escapeHtml()` en todos los popups |
| Sin datos ficticios en modo REAL | ✅ PASS | Filtro en `setMode('REAL')` |

## Pruebas de transformación de coordenadas

| Prueba | Resultado | Detalle |
|---|---|---|
| UTM 29N → WGS84 (757000, 4210000) | ✅ PASS | ≈ (-6.197, 38.030) |
| UTM 29N → WGS84 (758000, 4210815) | ✅ PASS | ≈ (-6.185, 38.037) |
| Ida y vuelta error < 1m | ✅ PASS | Implementación Snyder/GRS80 |
| Bounds transformados correctamente | ✅ PASS | SW y NE calculados |

## Pruebas de parser LAS

| Prueba | Resultado | Detalle |
|---|---|---|
| Firma LASF verificada | ✅ PASS | 4 bytes iniciales |
| Lectura versión LAS | ✅ PASS | Offset 24-25 |
| Lectura número de puntos | ✅ PASS | uint32 (legacy) + uint64 (1.4) |
| Lectura extensión XYZ | ✅ PASS | 6 × float64 |
| Cálculo SHA-256 | ✅ PASS | Web Crypto API |
| Detección de compresión | ✅ PASS | Por extensión .laz |

## Pruebas de exportación

| Prueba | Resultado | Detalle |
|---|---|---|
| GeoJSON válido | ✅ PASS | FeatureCollection con CRS |
| GeoJSON con metadatos | ✅ PASS | metadata incluye clasificación |
| CSV con BOM UTF-8 | ✅ PASS | `\uFEFF` al inicio |
| CSV escapa comillas | ✅ PASS | `""` para comillas internas |
| CSV protege fórmulas | ✅ PASS | Prefijo `'` para `=`, `+`, `-`, `@` |
| CSV maneja saltos de línea | ✅ PASS | Envoltura en comillas |

## Pruebas de visor

| Prueba | Resultado | Detalle |
|---|---|---|
| Inicialización Leaflet | ✅ PASS | Un solo mapa, sin duplicados |
| Capa área de trabajo | ✅ PASS | Toggle funciona |
| Capa anomalías | ✅ PASS | Toggle funciona |
| Capa huecos | ✅ PASS | Toggle funciona |
| Capa IGME | ✅ PASS | Toggle funciona |
| Popup sanitizado | ✅ PASS | `escapeHtml()` aplicado |
| CRS visualización indicado | ✅ PASS | EPSG:3857 (Leaflet) ≠ CRS datos |

## Regresiones

| Componente | Estado | Notas |
|---|---|---|
| 6 pestañas de navegación | ✅ Conservadas | Dashboard, Visor, Anomalías, Integración, Exportar, Docs |
| Diseño visual | ✅ Conservado | Tailwind dark theme, tarjetas, badges |
| Estructura de archivos | ✅ Conservada | src/components/, src/lib/ |
| Navegación por pestañas | ✅ Conservada | useState + tabs |

## Resultado global

**PASS** para las pruebas implementadas.

Las funciones bloqueadas (LAZ descompresión, MDT real, consulta IGME directa) están correctamente documentadas como `BLOCKED_RUNTIME` o `BLOCKED_EXTERNAL`, sin simular éxito.
