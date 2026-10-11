/**
 * JOULE POLICY ENGINE — Decisiones de enrutamiento
 * 
 * Decide entre:
 * - EXECUTE_NOW
 * - REUSE_VERIFIED_CACHE
 * - PROCESS_LOCAL_WORKER
 * - DEFER_LOW_PRIORITY
 * - CANCEL_OBSOLETE_TASK
 * - REQUIRE_AUTHORIZATION
 * - REJECT_INVALID_TASK
 * 
 * La calidad científica tiene prioridad sobre cualquier ahorro.
 * No delega verificación científica en modelos generativos.
 */

import { TaskContract, RouteDecision, PolicyDecision, JouleMode } from './types';
import { JouleCacheManager } from './cacheManager';

export interface PolicyConfig {
  mode: JouleMode;
  enableCache: boolean;
  enableCancellation: boolean;
  maxConcurrentTasks: number;
  policyVersion: string;
}

const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  mode: 'SHADOW',
  enableCache: true,
  enableCancellation: true,
  maxConcurrentTasks: 4,
  policyVersion: '1.0.0',
};

export class JoulePolicyEngine {
  private config: PolicyConfig;
  private cache: JouleCacheManager;
  private activeTasks: Set<string> = new Set();

  constructor(cache: JouleCacheManager, config: Partial<PolicyConfig> = {}) {
    this.config = { ...DEFAULT_POLICY_CONFIG, ...config };
    this.cache = cache;
  }

  /**
   * Decide ruta de ejecución para una tarea.
   */
  async decideRoute(task: TaskContract): Promise<PolicyDecision> {
    const timestamp = new Date().toISOString();
    
    // Validación básica
    if (!task.id || !task.type) {
      return {
        taskId: task.id,
        route: 'REJECT_INVALID_TASK',
        justification: 'Tarea inválida: falta ID o tipo',
        policyVersion: this.config.policyVersion,
        timestamp,
      };
    }
    
    // Verificar autorización si es necesario
    if (task.securityConstraints.length > 0) {
      // En modo real, verificar permisos
      // Por ahora, requerir autorización explícita
      return {
        taskId: task.id,
        route: 'REQUIRE_AUTHORIZATION',
        justification: `Tarea requiere autorización: ${task.securityConstraints.join(', ')}`,
        policyVersion: this.config.policyVersion,
        timestamp,
      };
    }
    
    // Verificar cache si está habilitado
    if (this.config.enableCache) {
      const cacheKey = JouleCacheManager.buildKey(
        task.type,
        task.sourceHash,
        task.inputHash,
        task.algorithmVersion,
        task.crs,
        task.regionOfInterest
      );
      
      const cached = this.cache.get(cacheKey);
      if (cached && cached.qualityVerified) {
        return {
          taskId: task.id,
          route: 'REUSE_VERIFIED_CACHE',
          justification: `Resultado verificado disponible en cache (hit #${cached.hitCount + 1})`,
          policyVersion: this.config.policyVersion,
          timestamp,
        };
      }
    }
    
    // Verificar concurrencia
    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      if (task.priority === 'LOW') {
        return {
          taskId: task.id,
          route: 'DEFER_LOW_PRIORITY',
          justification: `Tarea de baja prioridad diferida (${this.activeTasks.size}/${this.config.maxConcurrentTasks} activas)`,
          policyVersion: this.config.policyVersion,
          timestamp,
        };
      }
    }
    
    // Ejecutar ahora
    return {
      taskId: task.id,
      route: 'EXECUTE_NOW',
      justification: 'Sin cache disponible, ejecutando inmediatamente',
      policyVersion: this.config.policyVersion,
      timestamp,
    };
  }

  /**
   * Registra inicio de tarea.
   */
  registerTaskStart(taskId: string): void {
    this.activeTasks.add(taskId);
  }

  /**
   * Registra finalización de tarea.
   */
  registerTaskEnd(taskId: string): void {
    this.activeTasks.delete(taskId);
  }

  /**
   * Obtiene estadísticas.
   */
  getStats(): {
    activeTasks: number;
    maxConcurrent: number;
    mode: JouleMode;
  } {
    return {
      activeTasks: this.activeTasks.size,
      maxConcurrent: this.config.maxConcurrentTasks,
      mode: this.config.mode,
    };
  }

  /**
   * Cambia modo de operación.
   */
  setMode(mode: JouleMode): void {
    this.config.mode = mode;
  }

  /**
   * Obtiene modo actual.
   */
  getMode(): JouleMode {
    return this.config.mode;
  }
}
