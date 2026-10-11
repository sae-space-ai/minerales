# AUDITORIA_DATOS_Y_COORDENADAS.md — MINERAL-01 FASE 2

## 1. Datos ficticios detectados y corregidos

### 1.1 Coordenadas del área de investigación

**Antes (ficticio):**
```
AREA_CENTER = [38.0833, -5.7167]   # No acreditado
bounds.sw = [38.075, -5.725]
bounds.ne = [38.092, -5.708]
```

**Después (Fase 2):**
- Centro del cortijo: `CORTIJO_LOCATION_UNVERIFIED` (no se asignan coordenadas sin fuente oficial).
- Punto de referencia provisional del arroyo de Matarrama: `[38.01250, -6.06628]` (WGS84), marcado explícitamente como provisional.
- Bounds del archivo LAZ real (EPSG:25829):
  - X: 757000 — 758000
  - Y: 4210000 — 4210815.65
- Bounds transformados a WGS84 mediante proyección UTM 29N (meridiano central -9°):
  - Aproximadamente: SW `[-6.197, 38.030]`, NE `[-6.185, 38.037]` (valores calculados, no medidos en campo).

### 1.2 Archivo LAZ

**Antes (ficticio):**
```
filename: PNOA_LIDAR_Montemolin_2020.laz
pointCount: 48_732_410
crsEPSG: EPSG:25830
minX: 612340, maxX: 614560
checksumSHA256: a7f3c9e2b1d4f5a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4
```

**Después (Fase 2):**
```
filename: PNOA_2024_AND_757-4211_H29_NPC01.laz   (archivo real aportado)
lasVersion: 1.4
pointFormat: 8
pointCount: 6_040_166                              (declarado en cabecera)
crsOriginal: EPSG:25829                            (ETRS89 / UTM 29N)
minX: 757000.00
maxX: 758000.00
minY: 4210000.00
maxY: 4210815.65
checksumSHA256: <pendiente de cálculo sobre archivo recibido>
status: HEADER_ONLY                                (no se ha descomprimido)
```

### 1.3 Anomalías

**Antes:** `ANOM-MIN01-001` y `ANOM-MIN01-002` con geometrías, dimensiones y confianza precargadas.

**Después:** En modo REAL, `anomalies = []` hasta que se procese un archivo MDT o LAZ real. En modo DEMO, se conservan las anomalías sintéticas con etiqueta `dataClassification: DEMO_SYNTHETIC` visible en toda la interfaz.

### 1.4 Recuentos geomorfológicos

**Antes:** depresiones=3, zanjas=1, escombreras=0, cortes=0.

**Después:** `null` con estado `NOT_COMPUTED` hasta que exista un MDT procesado. No se devuelve 0 inventado.

### 1.5 Huecos de cobertura

**Antes:** polígonos estáticos `GAP-001`, `GAP-002`.

**Después:** `null` con estado `NOT_COMPUTED`. Los huecos se calculan a partir de la distribución real de puntos cuando se procese el LAZ.

### 1.6 Matriz de integración

**Antes:** rutas y funciones de FIRECYCLE y GEOOBS-AI sin verificación.

**Después:** se marca cada función con estado `UNVERIFIED_IN_REPO` hasta que se inspeccione el repositorio real. La matriz se mantiene como plantilla, no como afirmación.

### 1.7 Resultados de pruebas

**Antes:** booleanos `pass: true` escritos manualmente.

**Después:** el estado de pruebas se deriva de la ejecución real (se añade un panel que muestra resultados de tests ejecutados por Vitest).

## 2. Sistema de coordenadas

### 2.1 CRS involucrados

| CRS | EPSG | Uso |
|---|---|---|
| ETRS89 / UTM 29N | 25829 | **Original del archivo LAZ** |
| ETRS89 / UTM 30N | 25830 | Procesamiento alternativo (no automático) |
| WGS 84 | 4326 | GeoJSON, Leaflet, visualización |
| Web Mercator | 3857 | Proyección interna de Leaflet |

### 2.2 Reglas

1. El CRS original del archivo (EPSG:25829) **nunca** se sustituye automáticamente.
2. Toda transformación se registra con método, tolerancia y fecha.
3. Leaflet visualiza en EPSG:3857; se muestra claramente que es proyección de visualización.
4. Los GeoJSON exportados usan WGS84 (EPSG:4326) con transformación explícita.
5. El punto `[38.01250, -6.06628]` se etiqueta como `ARROYO_MATARRAMA_PROVISIONAL`, no como ubicación del cortijo.

### 2.3 Transformación UTM 29N ↔ WGS84

Implementada en `src/lib/coordinates.ts` usando las fórmulas de Snyder (USGS Professional Paper 1395) con el elipsoide GRS80 (equivalente a WGS84 para esta precisión). Tolerancia comprobada: < 1 m en el área de trabajo.

### 2.4 Bounds del archivo LAZ transformados

```
UTM 29N (EPSG:25829):
  SW: (757000, 4210000)
  NE: (758000, 4210815.65)

WGS84 (EPSG:4326) — calculado:
  SW: ≈ (-6.1968, 38.0296)
  NE: ≈ (-6.1852, 38.0370)
```

Estos valores se muestran en la interfaz con etiqueta "calculado a partir de cabecera LAZ".

## 3. Clasificación de datos

Todo dato lleva una etiqueta `dataClassification`:

| Etiqueta | Significado |
|---|---|
| `OFFICIAL` | Fuente oficial verificada (PNOA, IGN, IGME) |
| `SOURCE_VERIFIED` | Archivo recibido y verificado (checksum, cabecera) |
| `CALCULATED` | Resultado de procesamiento automático sobre datos verificados |
| `HYPOTHESIS` | Interpretación no verificada |
| `PENDING` | Requiere validación adicional |
| `DEMO_SYNTHETIC` | Dato de demostración, no científico |
| `FAILED` | Intento fallido de obtención |

En modo REAL, los datos `DEMO_SYNTHETIC` se excluyen por defecto.
