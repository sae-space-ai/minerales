/**
 * JOULE GOVERNOR — Orquestador principal
 * 
 * Integra todos los componentes:
 * - Task Profiler
 * - Policy Engine
 * - Scheduler
 * - Cache Manager
 * - Telemetry
 * 
 * NO sustituye motores científicos.
 * GOBIERNA su ejecución.
 */

import { TaskContract, TaskType, TaskPriority, JouleMode, RouteDecision } from './types';
import { JouleCacheManager } from './cacheManager';
import { JoulePolicyEngine } from './policyEngine';
import { JouleScheduler } from './scheduler';
import { JouleTelemetryCollector } from './telemetry';
import { createTaskContract } from './taskProfiler';

export class JouleGovernor {
  private cache: JouleCacheManager;
  private policyEngine: JoulePolicyEngine;
  private scheduler: JouleScheduler;
  private telemetry: JouleTelemetryCollector;
  private mode: JouleMode = 'SHADOW';

  constructor() {
    this.cache = new JouleCacheManager();
    this.policyEngine = new JoulePolicyEngine(this.cache);
    this.scheduler = new JouleScheduler(4);
    this.telemetry = new JouleTelemetryCollector();
  }

  /**
   * Ejecuta una tarea a través del gobernador.
   */
  async execute<T>(
    type: TaskType,
    priority: TaskPriority,
    parameters: Record<string, any>,
    executor: (task: TaskContract) => Promise<T>,
    options: {
      sourceHash?: string | null;
      crs?: string | null;
      region?: { minX: number; maxX: number; minY: number; maxY: number } | null;
      algorithmVersion?: string;
      cacheTtlMs?: number;
    } = {}
  ): Promise<T> {
    // Si JOULE está OFF, ejecutar directamente
    if (this.mode === 'OFF') {
      const task = await createTaskContract(type, priority, parameters, options);
      return executor(task);
    }

    // Crear contrato de tarea
    const task = await createTaskContract(type, priority, parameters, options);

    // Decidir ruta
    const decision = await this.policyEngine.decideRoute(task);

    // Si es cache hit, devolver resultado cacheado
    if (decision.route === 'REUSE_VERIFIED_CACHE') {
      const cacheKey = JouleCacheManager.buildKey(
        task.type,
        task.sourceHash,
        task.inputHash,
        task.algorithmVersion,
        task.crs,
        task.regionOfInterest
      );
      
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.telemetry.registerCacheReuse();
        this.updateTelemetry();
        return cached.data as T;
      }
    }

    // Si es defer, esperar (simplificado)
    if (decision.route === 'DEFER_LOW_PRIORITY') {
      // En implementación completa, diferir a cola de baja prioridad
    }

    // Ejecutar tarea
    this.policyEngine.registerTaskStart(task.id);
    
    try {
      const startTime = performance.now();
      
      const result = await this.scheduler.schedule(task, executor);
      
      const endTime = performance.now();
      const actualTimeMs = endTime - startTime;
      
      // Almacenar en cache si es apropiado
      if (options.cacheTtlMs !== 0) {
        const cacheKey = JouleCacheManager.buildKey(
          task.type,
          task.sourceHash,
          task.inputHash,
          task.algorithmVersion,
          task.crs,
          task.regionOfInterest
        );
        
        // Estimar tamaño del resultado
        const sizeBytes = estimateResultSize(result);
        
        this.cache.set(
          cacheKey,
          task.type,
          task.inputHash,
          task.sourceHash,
          task.algorithmVersion,
          result,
          sizeBytes,
          options.cacheTtlMs
        );
      }
      
      this.telemetry.registerExecution(actualTimeMs, task.estimatedTimeMs);
      this.policyEngine.registerTaskEnd(task.id);
      this.updateTelemetry();
      
      return result;
    } catch (error) {
      this.policyEngine.registerTaskEnd(task.id);
      this.updateTelemetry();
      throw error;
    }
  }

  /**
   * Cancela una tarea.
   */
  cancel(taskId: string): boolean {
    return this.scheduler.cancel(taskId);
  }

  /**
   * Cambia modo de operación.
   */
  setMode(mode: JouleMode): void {
    this.mode = mode;
    this.policyEngine.setMode(mode);
    this.telemetry.setMode(mode);
  }

  /**
   * Obtiene modo actual.
   */
  getMode(): JouleMode {
    return this.mode;
  }

  /**
   * Obtiene telemetría completa.
   */
  getTelemetry() {
    return {
      telemetry: this.telemetry.getTelemetry(),
      budget: this.telemetry.getBudget(),
      cache: this.cache.getStats(),
      scheduler: this.scheduler.getStats(),
      policy: this.policyEngine.getStats(),
      efficiency: this.telemetry.getEfficiencyMetrics(),
    };
  }

  /**
   * Limpia cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalida cache por tipo.
   */
  invalidateCacheByType(type: TaskType): void {
    this.cache.invalidateByType(type);
  }

  /**
   * Actualiza telemetría desde componentes.
   */
  private updateTelemetry(): void {
    this.telemetry.updateFromScheduler(this.scheduler.getStats());
    this.telemetry.updateFromCache(this.cache.getStats());
  }
}

/**
 * Estima tamaño de resultado en bytes.
 */
function estimateResultSize(result: any): number {
  if (result === null || result === undefined) {
    return 0;
  }
  
  if (typeof result === 'string') {
    return result.length * 2; // UTF-16
  }
  
  if (ArrayBuffer.isView(result)) {
    return result.byteLength;
  }
  
  if (result instanceof ArrayBuffer) {
    return result.byteLength;
  }
  
  // Estimación para objetos
  try {
    const json = JSON.stringify(result);
    return json.length * 2;
  } catch {
    return 1024; // Estimación conservadora
  }
}

// Instancia global singleton
export const jouleGovernor = new JouleGovernor();
