/**
 * Estado unificado de la misión MINERAL-01.
 * 
 * Separa estrictamente:
 * - DEMO_SYNTHETIC: datos de demostración, no científicos
 * - OFFICIAL: fuentes oficiales verificadas
 * - SOURCE_VERIFIED: archivos recibidos y verificados
 * - CALCULATED: procesamiento automático sobre datos verificados
 * - HYPOTHESIS: interpretación no verificada
 * - PENDING: requiere validación
 * - FAILED: intento fallido
 * 
 * En modo REAL, los datos DEMO_SYNTHETIC se excluyen por defecto.
 */

import { createContext, useContext } from 'react';
import type { MDTData } from './mdtProcessor';

export type DataClassification =
  | 'OFFICIAL'
  | 'SOURCE_VERIFIED'
  | 'CALCULATED'
  | 'HYPOTHESIS'
  | 'PENDING'
  | 'DEMO_SYNTHETIC'
  | 'FAILED';

export type ProcessingStatus =
  | 'NOT_STARTED'
  | 'HEADER_ONLY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED_RUNTIME'
  | 'BLOCKED_EXTERNAL'
  | 'FAILED';

export type QueryStatus =
  | 'NOT_QUERIED'
  | 'QUERY_SUCCESS'
  | 'QUERY_EMPTY'
  | 'QUERY_FAILED'
  | 'QUERY_PARTIAL'
  | 'QUERY_UNSUPPORTED';

export type AnomalyClassification =
  | 'GEOMETRIC_CANDIDATE'
  | 'POSSIBLE_ANTHROPIC_FEATURE'
  | 'DOCUMENTARY_MINING_RECORD'
  | 'SPATIALLY_CORRELATED_CANDIDATE'
  | 'HUMAN_REVIEWED'
  | 'MINING_CONFIRMED_WITH_DOCUMENTED_EVIDENCE';

export interface LASFileState {
  filename: string | null;
  fileSize: number | null;
  checksumSHA256: string | null;
  status: ProcessingStatus;
  headerRead: boolean;
  pointsDecompressed: boolean;
  groundClassified: boolean;
  crsOriginal: string | null;
  crsEPSG: number | null;
  pointCount: number | null;
  pointFormat: number | null;
  lasVersion: string | null;
  bounds: {
    xMin: number | null;
    xMax: number | null;
    yMin: number | null;
    yMax: number | null;
    zMin: number | null;
    zMax: number | null;
  };
  pointDensity: number | null;
  groundPointDensity: number | null;
  classDistribution: Record<number, number> | null;
  returnDistribution: Record<number, number> | null;
  dataClassification: DataClassification;
  parseTimestamp: string | null;
  errorMessage: string | null;
  processingTimeMs: number | null;
}

export interface MDTState {
  filename: string | null;
  width: number | null;
  height: number | null;
  resolution: number | null;
  bounds: {
    xMin: number | null;
    xMax: number | null;
    yMin: number | null;
    yMax: number | null;
  } | null;
  crs: string | null;
  noDataValue: number | null;
  status: ProcessingStatus;
  dataClassification: DataClassification;
  timestamp: string | null;
  errorMessage: string | null;
}

export interface IGMEQueryState {
  endpoint: string;
  status: QueryStatus;
  lastQueryTimestamp: string | null;
  lastQueryURL: string | null;
  crs: string | null;
  totalFeatures: number | null;
  features: IGMEFeature[];
  errorMessage: string | null;
  httpStatus: number | null;
  dataClassification: DataClassification;
}

export interface IGMEFeature {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number]; // [lon, lat] WGS84
  mineral: string | null;
  status: string | null;
  source: string;
  dataClassification: DataClassification;
}

export interface Anomaly {
  id: string;
  geometry: GeoJSON.Polygon | GeoJSON.Point;
  dimensions: { length: number | null; width: number | null; depth: number | null };
  elevation: number | null;
  sourceFile: string | null;
  methodology: string | null;
  sourceFingerprint: string | null;
  classification: AnomalyClassification;
  alternativeInterpretations: string[];
  distanceToChannel: number | null;
  igmeRecord: 'VERIFIED' | 'NO_VERIFICADO' | 'NOT_QUERIED';
  confidence: number | null;
  confirmed: boolean;
  humanReviewed: boolean;
  dataClassification: DataClassification;
  processingTimestamp: string | null;
}

export interface CoverageGap {
  id: string;
  geometry: GeoJSON.Polygon | null;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  dataClassification: DataClassification;
}

export interface GeomorphologicalState {
  depressions: { count: number | null; status: 'NOT_COMPUTED' | 'COMPUTED' | 'BLOCKED' };
  trenches: { count: number | null; status: 'NOT_COMPUTED' | 'COMPUTED' | 'BLOCKED' };
  spoilHeaps: { count: number | null; status: 'NOT_COMPUTED' | 'COMPUTED' | 'BLOCKED' };
  cuts: { count: number | null; status: 'NOT_COMPUTED' | 'COMPUTED' | 'BLOCKED' };
  thresholds: {
    minDepth: number;
    minSlope: number;
    minArea: number;
  };
  conclusion: 'INSUFFICIENT_DATA' | 'TOPOGRAPHIC_OBSERVATION' | 'HUMAN_ACTIVITY_HYPOTHESIS' | 'MINING_INDICIO';
  requiresHumanReview: boolean;
  dataClassification: DataClassification;
}

export interface MissionState {
  id: string;
  name: string;
  lineage: string[];
  createdAt: string;
  updatedAt: string;
  mode: 'DEMO' | 'REAL';
  lasFile: LASFileState;
  mdt: MDTState;
  igme: IGMEQueryState;
  anomalies: Anomaly[];
  coverageGaps: CoverageGap[];
  geomorphological: GeomorphologicalState;
  cortijoLocation: {
    status: 'UNVERIFIED' | 'PROVISIONAL' | 'VERIFIED';
    coordinates: [number, number] | null; // [lat, lon]
    source: string | null;
    note: string;
  };
  arroyoReference: {
    coordinates: [number, number]; // [lat, lon]
    note: string;
    status: 'PROVISIONAL';
  };
}

export const initialMissionState: MissionState = {
  id: 'MINERAL-01',
  name: 'MINERAL-01 — Indicios mineros Cortijo de Daniela',
  lineage: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'],
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: new Date().toISOString(),
  mode: 'DEMO',
  lasFile: {
    filename: null,
    fileSize: null,
    checksumSHA256: null,
    status: 'NOT_STARTED',
    headerRead: false,
    pointsDecompressed: false,
    groundClassified: false,
    crsOriginal: null,
    crsEPSG: null,
    pointCount: null,
    pointFormat: null,
    lasVersion: null,
    bounds: {
      xMin: null,
      xMax: null,
      yMin: null,
      yMax: null,
      zMin: null,
      zMax: null,
    },
    pointDensity: null,
    groundPointDensity: null,
    classDistribution: null,
    returnDistribution: null,
    dataClassification: 'PENDING',
    parseTimestamp: null,
    errorMessage: null,
    processingTimeMs: null,
  },
  mdt: {
    filename: null,
    width: null,
    height: null,
    resolution: null,
    bounds: null,
    crs: null,
    noDataValue: null,
    status: 'NOT_STARTED',
    dataClassification: 'PENDING',
    timestamp: null,
    errorMessage: null,
  },
  igme: {
    endpoint: 'https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query',
    status: 'NOT_QUERIED',
    lastQueryTimestamp: null,
    lastQueryURL: null,
    crs: null,
    totalFeatures: null,
    features: [],
    errorMessage: null,
    httpStatus: null,
    dataClassification: 'PENDING',
  },
  anomalies: [],
  coverageGaps: [],
  geomorphological: {
    depressions: { count: null, status: 'NOT_COMPUTED' },
    trenches: { count: null, status: 'NOT_COMPUTED' },
    spoilHeaps: { count: null, status: 'NOT_COMPUTED' },
    cuts: { count: null, status: 'NOT_COMPUTED' },
    thresholds: {
      minDepth: 1.5,
      minSlope: 15,
      minArea: 25,
    },
    conclusion: 'INSUFFICIENT_DATA',
    requiresHumanReview: true,
    dataClassification: 'PENDING',
  },
  cortijoLocation: {
    status: 'UNVERIFIED',
    coordinates: null,
    source: null,
    note: 'CORTIJO_LOCATION_UNVERIFIED — No se asignan coordenadas sin fuente cartográfica oficial.',
  },
  arroyoReference: {
    coordinates: [38.01250, -6.06628],
    note: 'ARROYO_MATARRAMA_PROVISIONAL — Punto de referencia provisional, no ubicación del cortijo.',
    status: 'PROVISIONAL',
  },
};

// Datos DEMO sintéticos (solo para demostración de la interfaz)
export const DEMO_ANOMALIES: Anomaly[] = [
  {
    id: 'DEMO-001',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-6.195, 38.032],
        [-6.193, 38.032],
        [-6.193, 38.034],
        [-6.195, 38.034],
        [-6.195, 38.032],
      ]],
    },
    dimensions: { length: null, width: null, depth: null },
    elevation: null,
    sourceFile: null,
    methodology: 'DEMO — sin procesamiento real',
    sourceFingerprint: null,
    classification: 'GEOMETRIC_CANDIDATE',
    alternativeInterpretations: [
      'DEMO: dato sintético de demostración',
      'No corresponde a ninguna observación real',
    ],
    distanceToChannel: null,
    igmeRecord: 'NOT_QUERIED',
    confidence: null,
    confirmed: false,
    humanReviewed: false,
    dataClassification: 'DEMO_SYNTHETIC',
    processingTimestamp: null,
  },
];

export const DEMO_COVERAGE_GAPS: CoverageGap[] = [
  {
    id: 'DEMO-GAP-001',
    geometry: null,
    reason: 'DEMO — huecos no calculados sin datos reales',
    severity: 'MEDIUM',
    dataClassification: 'DEMO_SYNTHETIC',
  },
];

// Contexto de React
export interface MissionContextType {
  state: MissionState;
  setMode: (mode: 'DEMO' | 'REAL') => void;
  loadLASFile: (file: File) => Promise<void>;
  processLAZFull: (file: File) => Promise<void>;
  loadMDT: (file: File) => Promise<void>;
  generateMDTFromLiDAR: (resolution?: number) => Promise<void>;
  queryIGME: () => Promise<void>;
  updateThresholds: (thresholds: { minDepth: number; minSlope: number; minArea: number }) => void;
  getLoadedMDT: () => MDTData | null;
}

export const MissionContext = createContext<MissionContextType | null>(null);

export function useMission(): MissionContextType {
  const ctx = useContext(MissionContext);
  if (!ctx) {
    throw new Error('useMission debe usarse dentro de MissionProvider');
  }
  return ctx;
}
