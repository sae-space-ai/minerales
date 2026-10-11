export interface LASHeader {
  filename: string;
  fileSize: number;
  pointCount: number;
  crs: string;
  crsEPSG: string;
  version: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  checksumSHA256: string;
  status: 'HEADER_ONLY' | 'PROCESSED' | 'BLOCKED_RUNTIME';
  source: string;
  dateVerified: string;
}

export interface IGMEQueryResult {
  endpoint: string;
  queryTimestamp: string;
  queryExact: string;
  crs: string;
  status: 'SUCCESS' | 'QUERY_FAILED' | 'NOT_QUERIED';
  totalFeatures: number | null;
  features: IGMEFeature[];
  distanceToArea: number | null;
  errorMessage?: string;
}

export interface IGMEFeature {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  distance: number;
  mineral: string;
  status: string;
}

export interface Anomaly {
  id: string;
  geometry: GeoJSON.Polygon | GeoJSON.Point;
  dimensions: { length: number; width: number; depth: number };
  elevation: number;
  sourceFile: string;
  methodology: string;
  sourceFingerprint: string;
  evidenceLevel: 'TOPOGRAPHIC_OBS' | 'HUMAN_ACTIVITY_HYPOTHESIS' | 'DOCUMENTARY_MINING_INDICIO';
  alternativeInterpretations: string[];
  distanceToChannel: number;
  igmeRecord: 'VERIFIED' | 'NO_VERIFICADO' | 'NOT_QUERIED';
  confidence: number;
  confirmed: boolean;
}

export interface MissionStatus {
  id: string;
  name: string;
  lineage: string[];
  createdAt: string;
  updatedAt: string;
  lasStatus: LASHeader;
  igmeStatus: IGMEQueryResult;
  processingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED_RUNTIME';
  geomorphologicalEvaluation: GeomorphologicalEval;
  anomalies: Anomaly[];
  coverageGaps: CoverageGap[];
}

export interface GeomorphologicalEval {
  depressions: PatternResult;
  trenches: PatternResult;
  spoilHeaps: PatternResult;
  cuts: PatternResult;
  thresholds: {
    minDepth: number;
    minSlope: number;
    minArea: number;
  };
  conclusion: 'TOPOGRAPHIC_OBSERVATION' | 'HUMAN_ACTIVITY_HYPOTHESIS' | 'MINING_INDICIO' | 'INSUFFICIENT_DATA';
  requiresHumanReview: boolean;
}

export interface PatternResult {
  detected: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  caveat: string;
}

export interface CoverageGap {
  id: string;
  geometry: GeoJSON.Polygon;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IntegrationMatrix {
  repo: string;
  existingFunctions: ExistingFunction[];
  newFunctions: NewFunction[];
}

export interface ExistingFunction {
  name: string;
  module: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'PLANNED';
  usedInMission: boolean;
}

export interface NewFunction {
  name: string;
  module: string;
  status: 'IMPLEMENTED' | 'PARTIAL' | 'BLOCKED';
  dependency: string;
  notes: string;
}

export interface ExportFormat {
  format: 'PDF' | 'CSV' | 'GeoJSON';
  available: boolean;
  differentiates: {
    official: boolean;
    calculated: boolean;
    hypothesis: boolean;
    pending: boolean;
  };
}
