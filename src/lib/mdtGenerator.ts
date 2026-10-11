/**
 * Generador optimizado de MDT desde LiDAR con índices espaciales.
 * 
 * Usa una rejilla de búsqueda espacial para evitar recorrer todos los puntos
 * para cada celda del raster. Mejora el rendimiento de O(n*m) a O(n*k)
 * donde k es el número promedio de puntos por celda de búsqueda.
 */

import { MDTData, MDTLoadResult } from './mdtProcessor';

/**
 * Estructura de índice espacial basado en rejilla (grid index).
 * Divide el espacio en celdas y asigna puntos a cada celda.
 */
class SpatialGridIndex {
  private grid: Map<string, Array<[number, number, number]>> = new Map();
  private cellSize: number;
  private xMin: number;
  private yMin: number;
  private width: number;
  private height: number;

  constructor(
    points: Array<[number, number, number]>,
    bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
    cellSize: number
  ) {
    this.cellSize = cellSize;
    this.xMin = bounds.xMin;
    this.yMin = bounds.yMin;
    this.width = Math.ceil((bounds.xMax - bounds.xMin) / cellSize);
    this.height = Math.ceil((bounds.yMax - bounds.yMin) / cellSize);

    // Asignar puntos a celdas
    for (const point of points) {
      const cellX = Math.floor((point[0] - this.xMin) / cellSize);
      const cellY = Math.floor((point[1] - this.yMin) / cellSize);
      const key = `${cellX},${cellY}`;
      
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(point);
    }
  }

  /**
   * Busca puntos dentro de un radio desde un punto central.
   */
  findNeighbors(
    x: number,
    y: number,
    radius: number
  ): Array<{ point: [number, number, number]; distance: number }> {
    const neighbors: Array<{ point: [number, number, number]; distance: number }> = [];
    
    // Calcular rango de celdas a buscar
    const minCellX = Math.floor((x - radius - this.xMin) / this.cellSize);
    const maxCellX = Math.floor((x + radius - this.xMin) / this.cellSize);
    const minCellY = Math.floor((y - radius - this.yMin) / this.cellSize);
    const maxCellY = Math.floor((y + radius - this.yMin) / this.cellSize);

    // Buscar en celdas dentro del rango
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cellPoints = this.grid.get(key);
        
        if (cellPoints) {
          for (const point of cellPoints) {
            const dx = point[0] - x;
            const dy = point[1] - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
              neighbors.push({ point, distance });
            }
          }
        }
      }
    }

    return neighbors;
  }
}

/**
 * Genera un MDT optimizado desde puntos LiDAR Ground usando índice espacial.
 * 
 * @param groundPoints - Array de puntos Ground [x, y, z]
 * @param bounds - Límites del MDT a generar
 * @param resolution - Resolución en metros por píxel
 * @param crs - Sistema de referencia de coordenadas
 * @param source - Nombre del archivo fuente
 * @param options - Opciones adicionales
 * @returns Resultado de la generación del MDT
 */
export function generateMDTFromLiDAROptimized(
  groundPoints: Array<[number, number, number]>,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  resolution: number,
  crs: string,
  source: string,
  options: {
    power?: number;
    searchRadiusMultiplier?: number;
    minPointsRequired?: number;
    onProgress?: (percent: number, message: string) => void;
  } = {}
): MDTLoadResult {
  const startTime = performance.now();
  
  const {
    power = 2,
    searchRadiusMultiplier = 10,
    minPointsRequired = 3,
    onProgress,
  } = options;
  
  // Validar que hay puntos suficientes
  if (groundPoints.length === 0) {
    return {
      success: false,
      mdt: null,
      errorMessage: 'No hay puntos Ground disponibles. Verifique que el archivo LiDAR tiene puntos clasificados como Ground (clase 2).',
      processingTimeMs: performance.now() - startTime,
    };
  }
  
  if (groundPoints.length < 10) {
    return {
      success: false,
      mdt: null,
      errorMessage: `Solo hay ${groundPoints.length} puntos Ground. Se requieren al menos 10 puntos para generar un MDT fiable.`,
      processingTimeMs: performance.now() - startTime,
    };
  }
  
  onProgress?.(10, 'Construyendo índice espacial...');
  
  // Calcular dimensiones del raster
  const width = Math.ceil((bounds.xMax - bounds.xMin) / resolution);
  const height = Math.ceil((bounds.yMax - bounds.yMin) / resolution);
  
  if (width <= 0 || height <= 0) {
    return {
      success: false,
      mdt: null,
      errorMessage: `Dimensiones inválidas: ${width}×${height}. Verifique los límites y la resolución.`,
      processingTimeMs: performance.now() - startTime,
    };
  }
  
  // Construir índice espacial con tamaño de celda = radio de búsqueda
  const searchRadius = resolution * searchRadiusMultiplier;
  const spatialIndex = new SpatialGridIndex(groundPoints, bounds, searchRadius);
  
  onProgress?.(30, 'Índice espacial construido. Interpolando elevaciones...');
  
  // Crear grid de elevaciones
  const grid = new Float32Array(width * height);
  const noDataValue = -9999;
  
  // Inicializar con NoData
  grid.fill(noDataValue);
  
  // Interpolar elevaciones usando IDW con índice espacial
  const totalCells = width * height;
  let processedCells = 0;
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Coordenadas del centro del píxel
      const x = bounds.xMin + (col + 0.5) * resolution;
      const y = bounds.yMin + (row + 0.5) * resolution;
      
      // Buscar puntos vecinos usando índice espacial (O(k) en lugar de O(n))
      const neighbors = spatialIndex.findNeighbors(x, y, searchRadius);
      
      // Si no hay suficientes puntos, dejar como NoData
      if (neighbors.length < minPointsRequired) {
        processedCells++;
        continue;
      }
      
      // Si hay un punto muy cercano, usar su elevación directamente
      const closest = neighbors.reduce((min, p) => p.distance < min.distance ? p : min);
      if (closest.distance < 0.01) {
        grid[row * width + col] = closest.point[2];
        processedCells++;
        continue;
      }
      
      // Interpolar usando IDW
      let sumWeights = 0;
      let sumValues = 0;
      
      for (const { point, distance } of neighbors) {
        const weight = 1 / Math.pow(distance, power);
        sumWeights += weight;
        sumValues += weight * point[2];
      }
      
      if (sumWeights > 0) {
        grid[row * width + col] = sumValues / sumWeights;
      }
      
      processedCells++;
      
      // Reportar progreso cada 10%
      if (processedCells % Math.floor(totalCells / 10) === 0) {
        const percent = 30 + Math.floor((processedCells / totalCells) * 60);
        onProgress?.(percent, `Interpolando... ${Math.floor((processedCells / totalCells) * 100)}%`);
      }
    }
  }
  
  onProgress?.(90, 'Calculando estadísticas de cobertura...');
  
  // Contar píxeles con datos
  let validPixels = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== noDataValue) {
      validPixels++;
    }
  }
  
  const coveragePercent = (validPixels / grid.length) * 100;
  
  // Advertir si la cobertura es baja
  if (coveragePercent < 50) {
    console.warn(`⚠️ Cobertura baja del MDT generado: ${coveragePercent.toFixed(1)}% de píxeles con datos.`);
  }
  
  const processingTimeMs = performance.now() - startTime;
  
  console.log(`✅ MDT generado desde LiDAR (optimizado): ${width}×${height} píxeles, ${validPixels} válidos (${coveragePercent.toFixed(1)}%), ${processingTimeMs.toFixed(2)}ms`);
  
  onProgress?.(100, 'MDT generado correctamente');
  
  return {
    success: true,
    mdt: {
      grid,
      width,
      height,
      resolution,
      bounds,
      noDataValue,
      crs,
      source: `${source} (MDT generado desde LiDAR)`,
      timestamp: new Date().toISOString(),
    },
    processingTimeMs,
  };
}
