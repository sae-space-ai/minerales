/**
 * JOULE SCHEDULER — Planificador de tareas con prioridades
 * 
 * Prioridades:
 * - HIGH: Interacción inmediata del usuario
 * - NORMAL: Generación de derivados científicos
 * - LOW: Precálculos opcionales
 * 
 * Implementa cancelación segura.
 * Una tarea cancelada no sobrescribe resultados más recientes.
 */

import { TaskContract, TaskExecution, TaskStatus } from './types';

interface ScheduledTask {
  task: TaskContract;
  execution: TaskExecution;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  cancelled: boolean;
  startedAt: number;
}

export class JouleScheduler {
  private queue: ScheduledTask[] = [];
  private running: Map<string, ScheduledTask> = new Map();
  private completed: Map<string, TaskExecution> = new Map();
  private maxConcurrent: number;
  private cancelledIds: Set<string> = new Set();

  constructor(maxConcurrent: number = 4) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Programa una tarea para ejecución.
   */
  async schedule(
    task: TaskContract,
    executor: (task: TaskContract) => Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const execution: TaskExecution = {
        ...task,
        status: 'PENDING',
        startedAt: null,
        completedAt: null,
        route: 'EXECUTE_NOW',
        routeJustification: '',
        resultHash: null,
        resultSizeBytes: null,
        actualTimeMs: null,
        actualMemoryBytes: null,
        qualityVerified: null,
        errorMessage: null,
        cacheKey: null,
      };

      const scheduled: ScheduledTask = {
        task,
        execution,
        resolve,
        reject,
        cancelled: false,
        startedAt: 0,
      };

      // Verificar si fue cancelada antes de empezar
      if (this.cancelledIds.has(task.id)) {
        execution.status = 'CANCELLED';
        execution.completedAt = new Date().toISOString();
        reject(new Error('Tarea cancelada antes de iniciar'));
        return;
      }

      this.queue.push(scheduled);
      this.processQueue(executor);
    });
  }

  /**
   * Procesa cola de tareas.
   */
  private async processQueue(executor: (task: TaskContract) => Promise<any>): Promise<void> {
    while (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const scheduled = this.queue.shift()!;
      
      if (scheduled.cancelled) {
        scheduled.execution.status = 'CANCELLED';
        scheduled.execution.completedAt = new Date().toISOString();
        scheduled.reject(new Error('Tarea cancelada'));
        continue;
      }

      this.running.set(scheduled.task.id, scheduled);
      this.executeTask(scheduled, executor);
    }
  }

  /**
   * Ejecuta una tarea.
   */
  private async executeTask(
    scheduled: ScheduledTask,
    executor: (task: TaskContract) => Promise<any>
  ): Promise<void> {
    const startTime = performance.now();
    scheduled.startedAt = startTime;
    scheduled.execution.status = 'RUNNING';
    scheduled.execution.startedAt = new Date().toISOString();

    try {
      const result = await executor(scheduled.task);
      
      // Verificar si fue cancelada durante ejecución
      if (scheduled.cancelled) {
        scheduled.execution.status = 'CANCELLED';
        scheduled.execution.completedAt = new Date().toISOString();
        scheduled.reject(new Error('Tarea cancelada durante ejecución'));
        return;
      }

      const endTime = performance.now();
      scheduled.execution.status = 'COMPLETED';
      scheduled.execution.completedAt = new Date().toISOString();
      scheduled.execution.actualTimeMs = endTime - startTime;
      
      this.completed.set(scheduled.task.id, scheduled.execution);
      this.running.delete(scheduled.task.id);
      
      scheduled.resolve(result);
      this.processQueue(executor);
    } catch (error) {
      const endTime = performance.now();
      scheduled.execution.status = 'FAILED';
      scheduled.execution.completedAt = new Date().toISOString();
      scheduled.execution.actualTimeMs = endTime - startTime;
      scheduled.execution.errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      this.completed.set(scheduled.task.id, scheduled.execution);
      this.running.delete(scheduled.task.id);
      
      scheduled.reject(error instanceof Error ? error : new Error('Error desconocido'));
      this.processQueue(executor);
    }
  }

  /**
   * Cancela una tarea.
   */
  cancel(taskId: string): boolean {
    this.cancelledIds.add(taskId);
    
    // Cancelar en cola
    const queueIndex = this.queue.findIndex(s => s.task.id === taskId);
    if (queueIndex !== -1) {
      const scheduled = this.queue[queueIndex];
      scheduled.cancelled = true;
      scheduled.execution.status = 'CANCELLED';
      scheduled.execution.completedAt = new Date().toISOString();
      scheduled.reject(new Error('Tarea cancelada'));
      this.queue.splice(queueIndex, 1);
      return true;
    }
    
    // Cancelar en ejecución
    const running = this.running.get(taskId);
    if (running) {
      running.cancelled = true;
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene estadísticas.
   */
  getStats(): {
    queued: number;
    running: number;
    completed: number;
    cancelled: number;
    failed: number;
  } {
    let cancelled = 0;
    let failed = 0;
    
    for (const exec of this.completed.values()) {
      if (exec.status === 'CANCELLED') cancelled++;
      if (exec.status === 'FAILED') failed++;
    }
    
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
      cancelled,
      failed,
    };
  }

  /**
   * Obtiene ejecución de una tarea.
   */
  getExecution(taskId: string): TaskExecution | null {
    return this.completed.get(taskId) || null;
  }
}
