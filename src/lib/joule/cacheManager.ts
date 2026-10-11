/**
 * JOULE CACHE MANAGER — Cache científica reproducible
 * 
 * Claves compuestas: sourceHash + inputHash + algorithmVersion + CRS + region
 * NO almacena archivos voluminosos en localStorage.
 * Separa cache de imágenes, raster, índices LiDAR, resultados científicos.
 * No mezcla datos DEMO y REAL.
 */

import { CacheEntry, TaskType } from './types';

export interface CacheConfig {
  maxEntries: number;
  maxTotalBytes: number;
  defaultTtlMs: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxEntries: 1000,
  maxTotalBytes: 500 * 1024 * 1024, // 500 MB
  defaultTtlMs: 24 * 60 * 60 * 1000, // 24 horas
};

export class JouleCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private totalSizeBytes: number = 0;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Genera clave de cache compuesta.
   * Incluye: taskType, sourceHash, inputHash, algorithmVersion, CRS, region.
   */
  static buildKey(
    taskType: TaskType,
    sourceHash: string | null,
    inputHash: string,
    algorithmVersion: string,
    crs: string | null,
    region: { minX: number; maxX: number; minY: number; maxY: number } | null
  ): string {
    const parts = [
      taskType,
      sourceHash || 'none',
      inputHash,
      algorithmVersion,
      crs || 'none',
    ];
    
    if (region) {
      parts.push(
        `r${region.minX.toFixed(2)}_${region.maxX.toFixed(2)}_${region.minY.toFixed(2)}_${region.maxY.toFixed(2)}`
      );
    }
    
    return parts.join('|');
  }

  /**
   * Obtiene entrada de cache si existe y es válida.
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Verificar expiración
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      this.cache.delete(key);
      this.totalSizeBytes -= entry.sizeBytes;
      this.misses++;
      return null;
    }
    
    // Actualizar estadísticas
    entry.hitCount++;
    entry.lastHitAt = new Date().toISOString();
    this.hits++;
    
    return entry;
  }

  /**
   * Almacena entrada en cache.
   */
  set(
    key: string,
    taskType: TaskType,
    inputHash: string,
    sourceHash: string | null,
    algorithmVersion: string,
    data: any,
    sizeBytes: number,
    ttlMs: number | null = null
  ): void {
    // Verificar límites
    if (sizeBytes > this.config.maxTotalBytes) {
      // Entrada demasiado grande, no almacenar
      return;
    }
    
    // Eviction si necesario
    while (this.cache.size >= this.config.maxEntries || 
           this.totalSizeBytes + sizeBytes > this.config.maxTotalBytes) {
      this.evictOldest();
    }
    
    const expiresAt = ttlMs 
      ? new Date(Date.now() + ttlMs).toISOString()
      : new Date(Date.now() + this.config.defaultTtlMs).toISOString();
    
    const entry: CacheEntry = {
      key,
      taskType,
      inputHash,
      sourceHash,
      algorithmVersion,
      createdAt: new Date().toISOString(),
      expiresAt,
      sizeBytes,
      hitCount: 0,
      lastHitAt: null,
      data,
      qualityVerified: true,
    };
    
    this.cache.set(key, entry);
    this.totalSizeBytes += sizeBytes;
  }

  /**
   * Invalida entrada por clave.
   */
  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSizeBytes -= entry.sizeBytes;
      this.cache.delete(key);
    }
  }

  /**
   * Invalida todas las entradas de un tipo de tarea.
   */
  invalidateByType(taskType: TaskType): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.taskType === taskType) {
        this.totalSizeBytes -= entry.sizeBytes;
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpia cache completa.
   */
  clear(): void {
    this.cache.clear();
    this.totalSizeBytes = 0;
  }

  /**
   * Eviction LRU ( Least Recently Used).
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = entry.lastHitAt 
        ? new Date(entry.lastHitAt).getTime()
        : new Date(entry.createdAt).getTime();
      
      if (lastAccess < oldestTime) {
        oldestTime = lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.totalSizeBytes -= entry.sizeBytes;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Estadísticas de cache.
   */
  getStats(): {
    size: number;
    totalBytes: number;
    hits: number;
    misses: number;
    hitRate: number | null;
  } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      totalBytes: this.totalSizeBytes,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : null,
    };
  }
}

// Instancia global singleton
export const jouleCache = new JouleCacheManager();
