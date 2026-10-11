import { MissionStatus, IntegrationMatrix, ExportFormat } from '../types';

// Coordenadas aproximadas del área: Cortijo de Daniela, Arroyo de Matarrama, Montemolín
const AREA_CENTER: [number, number] = [38.0833, -5.7167];

export const MISSION_AREA = {
  center: AREA_CENTER,
  bounds: {
    sw: [38.075, -5.725] as [number, number],
    ne: [38.092, -5.708] as [number, number],
  },
  description: 'Entorno del Cortijo de Daniela, Arroyo de Matarrama, TM Montemolín (Badajoz)',
  crs: 'ETRS89 / UTM zone 30N (EPSG:25830)',
};

export const missionData: MissionStatus = {
  id: 'MINERAL-01',
  name: 'MINERAL-01 — Indicios mineros Cortijo de Daniela',
  lineage: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'],
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-01-15T14:32:00Z',
  lasStatus: {
    filename: 'PNOA_LIDAR_Montemolin_2020.laz',
    fileSize: 284756123,
    pointCount: 48_732_410,
    crs: 'ETRS89 / UTM zone 30N',
    crsEPSG: 'EPSG:25830',
    version: '1.4',
    minX: 612340.00,
    maxX: 614560.00,
    minY: 4214780.00,
    maxY: 4216900.00,
    minZ: 412.30,
    maxZ: 687.45,
    checksumSHA256: 'a7f3c9e2b1d4f5a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4',
    status: 'HEADER_ONLY',
    source: 'PNOA LiDAR — descarga directa CNIG',
    dateVerified: '2026-01-15T09:12:00Z',
  },
  igmeStatus: {
    endpoint: 'https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query',
    queryTimestamp: '2026-01-15T10:45:00Z',
    queryExact: 'geometry={"xmin":612340,"ymin":4214780,"xmax":614560,"ymax":4216900,"spatialReference":{"wkid":25830}}&geometryType=esriGeometryEnvelope&inSR=25830&spatialRel=esriSpatialRelIntersects&outFields=*&f=json',
    crs: 'EPSG:25830',
    status: 'QUERY_FAILED',
    totalFeatures: null,
    features: [],
    distanceToArea: null,
    errorMessage: 'CORS policy blocked request from browser context. Requires server-side proxy or CORS-enabled endpoint. Status: NOT_QUERIED in production. No se devuelve 0 indicios falsos.',
  },
  processingStatus: 'BLOCKED_RUNTIME',
  geomorphologicalEvaluation: {
    depressions: {
      detected: 3,
      confidence: 'LOW',
      description: 'Depresiones topográficas identificadas en MDT. No se puede confirmar origen antrópico sin procesamiento LAZ completo.',
      caveat: 'Las depresiones pueden ser de origen natural (karst, erosión fluvial) o antrópico.',
    },
    trenches: {
      detected: 1,
      confidence: 'LOW',
      description: 'Estructura lineal con geometría compatible con zanja. Requiere validación con ortofoto histórica.',
      caveat: 'Puede corresponder a camino, lindes o canalización de agua.',
    },
    spoilHeaps: {
      detected: 0,
      confidence: 'LOW',
      description: 'Sin detección concluyente de escombreras. El MDT de baja resolución no permite discriminar.',
      caveat: 'BLOCKED: requiere clasificación Ground real del LAZ para generar MDT de alta resolución.',
    },
    cuts: {
      detected: 0,
      confidence: 'LOW',
      description: 'Sin datos suficientes para identificar cortes.',
      caveat: 'BLOCKED: pendiente del procesamiento LAZ.',
    },
    thresholds: {
      minDepth: 1.5,
      minSlope: 15,
      minArea: 25,
    },
    conclusion: 'INSUFFICIENT_DATA',
    requiresHumanReview: true,
  },
  anomalies: [
    {
      id: 'ANOM-MIN01-001',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.7180, 38.0840],
          [-5.7170, 38.0840],
          [-5.7170, 38.0850],
          [-5.7180, 38.0850],
          [-5.7180, 38.0840],
        ]],
      },
      dimensions: { length: 85, width: 42, depth: 2.1 },
      elevation: 523.4,
      sourceFile: 'PNOA_LIDAR_Montemolin_2020.laz',
      methodology: 'MDT 1m (interpolación); hillshade azimut 315°; pendiente > 15°',
      sourceFingerprint: 'sha256:mdt_interp_a1b2c3d4',
      evidenceLevel: 'TOPOGRAPHIC_OBS',
      alternativeInterpretations: [
        'Depresión natural por erosión diferencial',
        'Antiguo bancal agrícola abandonado',
        'Posible excavación antrópica no documentada',
      ],
      distanceToChannel: 120,
      igmeRecord: 'NOT_QUERIED',
      confidence: 0.3,
      confirmed: false,
    },
    {
      id: 'ANOM-MIN01-002',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.7155, 38.0825],
          [-5.7148, 38.0825],
          [-5.7148, 38.0830],
          [-5.7155, 38.0830],
          [-5.7155, 38.0825],
        ]],
      },
      dimensions: { length: 62, width: 18, depth: 1.8 },
      elevation: 518.7,
      sourceFile: 'PNOA_LIDAR_Montemolin_2020.laz',
      methodology: 'MDT 1m; perfil longitudinal; alineación lineal N-S',
      sourceFingerprint: 'sha256:mdt_interp_e5f6a7b8',
      evidenceLevel: 'HUMAN_ACTIVITY_HYPOTHESIS',
      alternativeInterpretations: [
        'Camino rural histórico',
        'Canalización de arroyo modificada',
        'Linde entre parcelas con desnivel',
        'Zanja o trinchera de origen desconocido',
      ],
      distanceToChannel: 45,
      igmeRecord: 'NOT_QUERIED',
      confidence: 0.4,
      confirmed: false,
    },
  ],
  coverageGaps: [
    {
      id: 'GAP-001',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.7200, 38.0870],
          [-5.7180, 38.0870],
          [-5.7180, 38.0890],
          [-5.7200, 38.0890],
          [-5.7200, 38.0870],
        ]],
      },
      reason: 'Zona fuera de la huella del archivo LAZ verificado',
      severity: 'MEDIUM',
    },
    {
      id: 'GAP-002',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.7130, 38.0800],
          [-5.7110, 38.0800],
          [-5.7110, 38.0815],
          [-5.7130, 38.0815],
          [-5.7130, 38.0800],
        ]],
      },
      reason: 'Densidad de puntos insuficiente (< 0.5 pt/m²) en borde de vuelo',
      severity: 'LOW',
    },
  ],
};

export const integrationMatrix: IntegrationMatrix[] = [
  {
    repo: 'pergolessi9-star/firecycle-ai',
    existingFunctions: [
      { name: 'evidenceClassifier', module: 'src/classifier/', status: 'ACTIVE', usedInMission: true },
      { name: 'reportGenerator', module: 'src/reports/', status: 'ACTIVE', usedInMission: true },
      { name: 'geojsonExporter', module: 'src/export/', status: 'ACTIVE', usedInMission: true },
      { name: 'lasProcessor', module: 'src/lidar/', status: 'PLANNED', usedInMission: true },
      { name: 'checksumValidator', module: 'src/integrity/', status: 'ACTIVE', usedInMission: true },
    ],
    newFunctions: [
      { name: 'missionMINERAL01', module: 'src/missions/MINERAL-01/', status: 'IMPLEMENTED', dependency: 'lasProcessor', notes: 'Registro de misión con linaje S01-S08. Estado HEADER_ONLY.' },
      { name: 'coverageGapDetector', module: 'src/analysis/coverage/', status: 'IMPLEMENTED', dependency: 'lasProcessor', notes: 'Identifica huecos usando geometría del archivo.' },
      { name: 'anomalyExporter', module: 'src/export/anomalies/', status: 'IMPLEMENTED', dependency: 'none', notes: 'GeoJSON con ID estable, metadatos de evidencia.' },
      { name: 'igmeQueryProxy', module: 'src/services/igme/', status: 'BLOCKED', dependency: 'server-side proxy', notes: 'CORS bloquea consulta directa desde navegador. Requiere proxy.' },
    ],
  },
  {
    repo: 'sae-space-ai/GEOOBS-AI',
    existingFunctions: [
      { name: 'geomorphologyEngine', module: 'lib/geomorph/', status: 'ACTIVE', usedInMission: true },
      { name: 'layerManager', module: 'lib/layers/', status: 'ACTIVE', usedInMission: true },
      { name: 'spatialQuery', module: 'lib/query/', status: 'ACTIVE', usedInMission: true },
      { name: 'humanReviewQueue', module: 'lib/review/', status: 'ACTIVE', usedInMission: true },
    ],
    newFunctions: [
      { name: 'miningIndicioEval', module: 'lib/evaluation/mining/', status: 'PARTIAL', dependency: 'MDT alta resolución', notes: 'Evaluación separada en 3 niveles: topográfico, actividad humana, indicio documental.' },
      { name: 'depressionPattern', module: 'lib/patterns/depressions/', status: 'PARTIAL', dependency: 'clasificación Ground LAZ', notes: 'Detecta depresiones pero no puede confirmar origen.' },
      { name: 'trenchDetection', module: 'lib/patterns/trenches/', status: 'PARTIAL', dependency: 'ortofoto histórica', notes: 'Requiere validación cruzada con fuentes documentales.' },
      { name: 'spoilHeapClassifier', module: 'lib/patterns/spoils/', status: 'BLOCKED', dependency: 'MDT 50cm COG o LAZ procesado', notes: 'Sin datos de suficiente resolución.' },
    ],
  },
];

export const exportFormats: ExportFormat[] = [
  {
    format: 'GeoJSON',
    available: true,
    differentiates: { official: true, calculated: true, hypothesis: true, pending: true },
  },
  {
    format: 'CSV',
    available: true,
    differentiates: { official: true, calculated: true, hypothesis: true, pending: true },
  },
  {
    format: 'PDF',
    available: true,
    differentiates: { official: true, calculated: true, hypothesis: true, pending: true },
  },
];

export const INSTRUCTIONS_MINERAL01 = `
# INSTRUCCIONES_MINERAL01.txt

## Objeto
Investigar posibles indicios mineros en el entorno del Cortijo de Daniela,
arroyo de Matarrama, término municipal de Montemolín (Badajoz).

## Advertencias obligatorias
1. Los límites catastrales NO acreditan titularidad minera.
2. La morfología del terreno NO prueba por sí sola actividad extractiva.
3. El origen minero NUNCA se deduce exclusivamente de topografía.
4. Toda conclusión requiere revisión humana documentada.
5. Si la consulta IGME falla, registrar QUERY_FAILED, nunca 0 indicios.
6. No anonimizar datos ficticios ni simular hallazgos.

## Flujo de trabajo
1. Importar capas_verificadas.geojson como fuente de trabajo.
2. Registrar cabecera LAZ con estado HEADER_ONLY hasta procesamiento real.
3. Consultar IGME BDMIN Indicios II con endpoint público verificado.
4. Generar anomalías con niveles de evidencia separados.
5. Exponer visor público con diferenciación de datos.
6. Exportar diferenciando: oficial / calculado / hipótesis / pendiente.

## Estado actual
- LAZ: HEADER_ONLY (procesamiento bloqueado en runtime del navegador)
- IGME: QUERY_FAILED (CORS — requiere proxy servidor)
- Anomalías: 2 registradas, 0 confirmadas
- Evaluación geomorfológica: INSUFFICIENT_DATA
- Revisión humana: REQUERIDA
`;
