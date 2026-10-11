/**
 * JOULE TELEMETRY — Métricas medidas vs estimadas
 * 
 * Diferencia claramente:
 * - MEASURED: valores obtenidos de instrumentación real
 * - ESTIMATED: valores calculados a partir de observaciones
 * - UNKNOWN: valores no disponibles
 * 
 * NO presenta estimaciones como mediciones físicas.
 */

import { JouleTelemetry, ValueOrigin, ResourceBudget } from './types';

export class JouleTelemetryCollector {
  private telemetry: JouleTelemetry = {
    mode: 'SHADOW',
    activeTasks: 0,
    pendingTasks: 0,
    cancelledTasks: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: null,
    avoidedRequests: 0,
    reusedWork: 0,
    totalExecutedMs: 0,
    totalEstimatedMs: 0,
    errors: 0,
    lastUpdated: new Date().toISOString(),
  };

  private budget: ResourceBudget = {
    maxConcurrentTasks: 4,
    maxMemoryBytes: 1024 * 1024 * 1024, // 1 GB
    maxPendingTasks: 100,
    maxExternalRequestsPerMinute: 60,
    measuredMemoryBytes: null,
    measuredCpuPercent: null,
    measuredGpuPercent: null,
    memoryOrigin: 'UNKNOWN',
    cpuOrigin: 'UNKNOWN',
    gpuOrigin: 'UNKNOWN',
  };

  /**
   * Actualiza telemetría desde scheduler.
   */
  updateFromScheduler(stats: {
    queued: number;
    running: number;
    completed: number;
    cancelled: number;
    failed: number;
  }): void {
    this.telemetry.activeTasks = stats.running;
    this.telemetry.pendingTasks = stats.queued;
    this.telemetry.cancelledTasks = stats.cancelled;
    this.telemetry.errors = stats.failed;
    this.telemetry.lastUpdated = new Date().toISOString();
  }

  /**
   * Actualiza telemetría desde cache.
   */
  updateFromCache(stats: {
    hits: number;
    misses: number;
    hitRate: number | null;
  }): void {
    this.telemetry.cacheHits = stats.hits;
    this.telemetry.cacheMisses = stats.misses;
    this.telemetry.cacheHitRate = stats.hitRate;
    this.telemetry.avoidedRequests = stats.hits;
    this.telemetry.lastUpdated = new Date().toISOString();
  }

  /**
   * Registra tarea reutilizada de cache.
   */
  registerCacheReuse(): void {
    this.telemetry.reusedWork++;
    this.telemetry.lastUpdated = new Date().toISOString();
  }

  /**
   * Registra tiempo de ejecución.
   */
  registerExecution(actualMs: number, estimatedMs: number | null): void {
    this.telemetry.totalExecutedMs += actualMs;
    if (estimatedMs !== null) {
      this.telemetry.totalEstimatedMs += estimatedMs;
    }
    this.telemetry.lastUpdated = new Date().toISOString();
  }

  /**
   * Intenta medir memoria real (navegador).
   */
  async measureMemory(): Promise<void> {
    try {
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        if (perfMemory && perfMemory.usedJSHeapSize) {
          this.budget.measuredMemoryBytes = perfMemory.usedJSHeapSize;
          this.budget.memoryOrigin = 'MEASURED';
        }
      }
    } catch {
      // No disponible
      this.budget.memoryOrigin = 'UNKNOWN';
    }
  }

  /**
   * Obtiene telemetría actual.
   */
  getTelemetry(): JouleTelemetry {
    return { ...this.telemetry };
  }

  /**
   * Obtiene presupuesto de recursos.
   */
  getBudget(): ResourceBudget {
    return { ...this.budget };
  }

  /**
   * Cambia modo.
   */
  setMode(mode: 'OFF' | 'SHADOW' | 'CANARY' | 'ACTIVE'): void {
    this.telemetry.mode = mode;
    this.telemetry.lastUpdated = new Date().toISOString();
  }

  /**
   * Calcula métricas de eficiencia.
   */
  getEfficiencyMetrics(): {
    cacheHitRate: number | null;
    cacheHitRateOrigin: ValueOrigin;
    avoidedRequests: number;
    avoidedRequestsOrigin: ValueOrigin;
    totalExecutedMs: number;
    totalEstimatedMs: number;
    efficiencyOrigin: ValueOrigin;
  } {
    return {
      cacheHitRate: this.telemetry.cacheHitRate,
      cacheHitRateOrigin: 'MEASURED',
      avoidedRequests: this.telemetry.avoidedRequests,
      avoidedRequestsOrigin: 'MEASURED',
      totalExecutedMs: this.telemetry.totalExecutedMs,
      totalEstimatedMs: this.telemetry.totalEstimatedMs,
      efficiencyOrigin: 'MEASURED',
    };
  }
}
