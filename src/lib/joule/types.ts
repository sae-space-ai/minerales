/**
 * JOULE MINERAL GOVERNOR — Tipos y contratos
 * 
 * Motor transversal de gestión y optimización de operaciones.
 * NO es un dashboard de métricas ni un asistente conversacional.
 * NO sustituye motores científicos.
 * GOBIERNA su ejecución.
 */

export type JouleMode = 'OFF' | 'SHADOW' | 'CANARY' | 'ACTIVE';

export type TaskType =
  | 'LIDAR_HEADER_READ'
  | 'LIDAR_DECOMPRESS'
  | 'LIDAR_CLASSIFICATION'
  | 'LIDAR_SPATIAL_INDEX'
  | 'MICROCELL_QUERY'
  | 'MDT_LOAD'
  | 'MDT_WINDOW_READ'
  | 'HILLSHADE_GENERATION'
  | 'SLOPE_CALCULATION'
  | 'CURVATURE_CALCULATION'
  | 'WMS_REQUEST'
  | 'IGME_QUERY'
  | 'CESIUM_LAYER_LOAD'
  | 'GEOSPATIAL_ANALYSIS'
  | 'AI_COMMAND'
  | 'REPORT_GENERATION'
  | 'EXPORT_OPERATION';

export type TaskPriority = 'HIGH' | 'NORMAL' | 'LOW';

export type TaskStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REUSED_CACHE';

export type RouteDecision =
  | 'EXECUTE_NOW'
  | 'REUSE_VERIFIED_CACHE'
  | 'PROCESS_LOCAL_WORKER'
  | 'DEFER_LOW_PRIORITY'
  | 'CANCEL_OBSOLETE_TASK'
  | 'REQUIRE_AUTHORIZATION'
  | 'REJECT_INVALID_TASK';

export type ValueOrigin = 'MEASURED' | 'ESTIMATED' | 'UNKNOWN';

export interface TaskContract {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  sourceHash: string | null; // SHA-256 de la fuente
  inputHash: string; // SHA-256 de los parámetros de entrada
  crs: string | null;
  regionOfInterest: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null;
  parameters: Record<string, any>;
  algorithmVersion: string;
  estimatedMemoryBytes: number | null;
  estimatedTimeMs: number | null;
  precisionRequirement: string | null;
  securityConstraints: string[];
  dependencies: string[];
  createdAt: string;
}

export interface TaskExecution extends TaskContract {
  status: TaskStatus;
  startedAt: string | null;
  completedAt: string | null;
  route: RouteDecision;
  routeJustification: string;
  resultHash: string | null;
  resultSizeBytes: number | null;
  actualTimeMs: number | null;
  actualMemoryBytes: number | null;
  qualityVerified: boolean | null;
  errorMessage: string | null;
  cacheKey: string | null;
}

export interface CacheEntry {
  key: string;
  taskType: TaskType;
  inputHash: string;
  sourceHash: string | null;
  algorithmVersion: string;
  createdAt: string;
  expiresAt: string | null;
  sizeBytes: number;
  hitCount: number;
  lastHitAt: string | null;
  data: any;
  qualityVerified: boolean;
}

export interface ResourceBudget {
  maxConcurrentTasks: number;
  maxMemoryBytes: number;
  maxPendingTasks: number;
  maxExternalRequestsPerMinute: number;
  measuredMemoryBytes: number | null;
  measuredCpuPercent: number | null;
  measuredGpuPercent: number | null;
  memoryOrigin: ValueOrigin;
  cpuOrigin: ValueOrigin;
  gpuOrigin: ValueOrigin;
}

export interface ExperienceRecord {
  taskType: TaskType;
  inputCharacteristics: string;
  route: RouteDecision;
  policyVersion: string;
  actualTimeMs: number;
  actualMemoryBytes: number | null;
  costMeasured: number | null;
  costOrigin: ValueOrigin;
  resultQuality: 'PASS' | 'FAIL' | 'DEGRADED';
  errors: string[];
  timestamp: string;
}

export interface JouleTelemetry {
  mode: JouleMode;
  activeTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number | null;
  avoidedRequests: number;
  reusedWork: number;
  totalExecutedMs: number;
  totalEstimatedMs: number;
  errors: number;
  lastUpdated: string;
}

export interface PolicyDecision {
  taskId: string;
  route: RouteDecision;
  justification: string;
  policyVersion: string;
  timestamp: string;
}
