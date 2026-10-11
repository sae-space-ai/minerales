import type { MissionStatus, IntegrationMatrix, ExportFormat } from '../types';

// Referencia del arroyo que debe verificarse con cartografía oficial:
// NO son coordenadas acreditadas del edificio «Cortijo de Daniela».
export const MISSION_AREA = {
  center: [38.0125, -6.06628] as [number, number],
  coordinateStatus: 'PROVISIONAL_STREAM_REFERENCE_NOT_CORTIJO',
  description: 'Arroyo Matarrama: punto provisional; la ubicación exacta del cortijo está por verificar.',
  // Envolvente geográfica proyectada de la CABECERA del archivo (no huella completa de retornos).
  verifiedLasEnvelope: [
    [-6.0730640, 38.0012748],
    [-6.0616890, 38.0009909],
    [-6.0613957, 38.0083326],
    [-6.0727719, 38.0086165],
    [-6.0730640, 38.0012748],
  ] as [number, number][],
  laserEPSG: 25829,
} as const;

export const missionData: MissionStatus = {
  id: 'MINERAL-01',
  name: 'MINERAL-01 — Investigación documental Matarrama',
  lineage: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'],
  createdAt: '2026-10-11T00:00:00Z', // Inicio de este conjunto de datos auditado, NO del estudio original
  updatedAt: '2026-10-11T00:00:00Z',
  lasStatus: {
    filename: 'PNOA_2024_AND_757-4211_H29_NPC01.laz',
    fileSize: 43236138,
    pointCount: 6040166, // RECUENTO DECLARADO EN CABECERA, no retornos procesados
    crs: 'ETRS89 / UTM zona 29N',
    crsEPSG: 'EPSG:25829',
    version: '1.4',
    minX: 757000, maxX: 758000,
    minY: 4210000, maxY: 4210815.65,
    minZ: 427.67, maxZ: 558.48,
    checksumSHA256: '34a1919efad4d1a49fe028ee88b07a74632847aba2f256d3d11fed8bae80404a',
    status: 'HEADER_ONLY',
    source: 'Archivo de usuario, denominado PNOA_2024_AND_757-4211_H29_NPC01.laz; metadatos de cabecera comprobados',
    dateVerified: '2026-10-11T00:00:00Z',
  },
  igmeStatus: {
    endpoint: 'https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query',
    queryTimestamp: '',
    queryExact: '',
    crs: 'EPSG:4326 / consulta geográfica pendiente',
    status: 'NOT_QUERIED',
    totalFeatures: null,
    features: [],
    distanceToArea: null,
    errorMessage: 'Sin consulta espacial IGME verificada en este repositorio. NO se conoce el recuento.',
  },
  processingStatus: 'PENDING',
  geomorphologicalEvaluation: {
    depressions: {
      detected: null, confidence: 'NOT_EVALUATED',
      description: 'No evaluadas: no se ha calculado un MDT real de esta zona.',
      caveat: 'Sin medición, no puede estimarse su existencia, profundidad ni origen.',
    },
    trenches: {
      detected: null, confidence: 'NOT_EVALUATED',
      description: 'No evaluadas: falta MDT real y análisis de perfiles.',
      caveat: 'Las estructuras lineales también pueden ser cauces, caminos o lindes.',
    },
    spoilHeaps: {
      detected: null, confidence: 'NOT_EVALUATED',
      description: 'No evaluadas; escombreras mineras no acreditadas ni descartadas.',
      caveat: 'Los montículos tienen múltiples posibles orígenes agrícolas y naturales.',
    },
    cuts: {
      detected: null, confidence: 'NOT_EVALUATED',
      description: 'No evaluados: pendiente de relieve de alta resolución.',
      caveat: 'No confundir cortes de carretera, erosión o terrazas con minería.',
    },
    thresholds: { minDepth: 1.5, minSlope: 15, minArea: 25 }, // Umbrales de diseño, NUNCA ejecutados
    conclusion: 'INSUFFICIENT_DATA',
    requiresHumanReview: true,
  },
  anomalies: [], // NINGUNA ANOMALÍA GEORREFERENCIADA VERIFICABLE. NO = cero anomalías reales.
  coverageGaps: [], // Ausencia de polígonos verificados; NO = ausencia de huecos de cobertura.
};

export const integrationMatrix: IntegrationMatrix[] = [
  {
    repo: 'sae-space-ai/minerales',
    existingFunctions: [
      { name: 'Interfaz React y visualización cartográfica', module: 'src/App.tsx; src/components/MapView.tsx', status: 'ACTIVE', usedInMission: true },
    ],
    newFunctions: [
      { name: 'Motor de análisis LAZ/MDT real', module: 'PENDIENTE', status: 'BLOCKED',
        dependency: 'MDT oficial y capacidad de procesamiento', notes: 'No hay detección científica operativa en este repositorio.' },
    ],
  },
  {
    repo: 'pergolessi9-star/firecycle-ai',
    existingFunctions: [],
    newFunctions: [
      { name: 'API de estado e IGME MINERAL-01', module: 'app/api/mineral01/', status: 'PARTIAL',
        dependency: 'PR #15 aún no fusionado; pruebas de consulta IGME pendientes',
        notes: 'No existe conexión implementada desde este frontend a FIRECYCLE.' },
    ],
  },
  {
    repo: 'sae-space-ai/GEOOBS-AI',
    existingFunctions: [],
    newFunctions: [
      { name: 'Integración de resultados geomorfológicos', module: 'NO IMPLEMENTADO', status: 'BLOCKED',
        dependency: 'Análisis MDT real y contrato de intercambio validado',
        notes: 'El nombre GEOOBS-AI en la cabecera no equivale a una integración técnica.' },
    ],
  },
];

export const exportFormats: ExportFormat[] = [
  { format: 'GeoJSON', available: true, differentiates: { official:true, calculated:true, hypothesis:true, pending:true } },
  { format: 'CSV', available: true, differentiates: { official:true, calculated:true, hypothesis:true, pending:true } },
  { format: 'PDF', available: false, differentiates: { official:false, calculated:false, hypothesis:false, pending:false } },
];

export const INSTRUCTIONS_MINERAL01 = `
MINERAL-01 — ALCANCE REAL Y NORMAS DE EVIDENCIA (revisión 11/10/2026)

1. El punto 38.01250, -6.06628 es provisional del arroyo, NO el Cortijo de Daniela.
2. Archivo comprobado por cabecera: PNOA_2024_AND_757-4211_H29_NPC01.laz.
3. El LAZ está en EPSG:25829, tiene 6.040.166 retornos DECLARADOS.
4. No hay procesamiento de retornos de suelo ni MDT real asociado a este estudio.
5. No hay anomalías MINERAL-01 georreferenciadas científicamente.
6. No hay registros espaciales IGME consultados con éxito en este repositorio.
7. Ausencia de datos NO significa ausencia de actividad minera.
8. Las geometrías catastrales de las parcelas 31-38 no están acreditadas por los DXF analizados.
9. No deducir derechos mineros a partir de parcelas ni presencia de mena a partir de formas topográficas.
10. Estado final: NO CONCLUSIVO hasta obtención del MDT, consulta oficial y peritaje.
`;
