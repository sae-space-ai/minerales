/**
 * Procesador LAZ real usando laz-perf (WASM).
 * 
 * Desbloquea: descompresión de puntos, clasificación Ground,
 * densidad real, cobertura real, cotas reales.
 * 
 * Requiere: archivo LAZ/LAS completo cargado por el usuario.
 */

import { readLASHeader, LASHeaderInfo } from './lasReader';

export interface LAZDecompressionResult {
  success: boolean;
  pointCount: number;
  groundPointCount: number;
  classifiedPointCount: number;
  unclassifiedPointCount: number;
  otherPointCount: number;
  
  // Bounds reales calculados de los puntos
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
  };
  
  // Densidad real
  density: {
    pointsPerSquareMeter: number;
    groundPointsPerSquareMeter: number;
    area: number;
  };
  
  // Distribución de clases (LAS specification)
  classDistribution: Record<number, number>;
  
  // Distribución de retornos
  returnDistribution: Record<number, number>;
  
  // Tiempo de procesamiento
  processingTimeMs: number;
  
  // Muestra de puntos (para visualización, máx 10000)
  samplePoints: Float32Array | null;
  sampleSize: number;
  
  // Metadata
  header: LASHeaderInfo;
  timestamp: string;
  errorMessage?: string;
}

export interface ProcessingProgress {
  phase: 'READING' | 'DECOMPRESSING' | 'CLASSIFYING' | 'ANALYZING' | 'COMPLETE' | 'ERROR';
  percent: number;
  message: string;
  pointsProcessed: number;
  totalPoints: number;
}

type ProgressCallback = (progress: ProcessingProgress) => void;

/**
 * Descomprime un archivo LAZ/LAS y extrae puntos reales.
 * 
 * Para archivos LAS sin compresión, lee directamente.
 * Para LAZ, usa laz-perf para descomprimir.
 */
export async function decompressLAZ(
  buffer: ArrayBuffer,
  filename: string,
  onProgress?: ProgressCallback,
  maxSamplePoints: number = 10000
): Promise<LAZDecompressionResult> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  
  // Leer cabecera
  const header = readLASHeader(buffer, filename);
  if (header.status === 'PARSE_ERROR') {
    return {
      success: false,
      pointCount: 0,
      groundPointCount: 0,
      classifiedPointCount: 0,
      unclassifiedPointCount: 0,
      otherPointCount: 0,
      bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0 },
      density: { pointsPerSquareMeter: 0, groundPointsPerSquareMeter: 0, area: 0 },
      classDistribution: {},
      returnDistribution: {},
      processingTimeMs: 0,
      samplePoints: null,
      sampleSize: 0,
      header,
      timestamp,
      errorMessage: header.errorMessage,
    };
  }
  
  onProgress?.({
    phase: 'READING',
    percent: 10,
    message: 'Cabecera leída. Iniciando descompresión...',
    pointsProcessed: 0,
    totalPoints: header.numberOfPoints,
  });
  
  try {
    // Intentar usar laz-perf para LAZ
    let points: Float32Array;
    let pointCount: number;
    
    if (header.isCompressed) {
      // LAZ comprimido — requiere laz-perf
      onProgress?.({
        phase: 'DECOMPRESSING',
        percent: 20,
        message: 'Descomprimiendo LAZ con laz-perf...',
        pointsProcessed: 0,
        totalPoints: header.numberOfPoints,
      });
      
      const result = await decompressWithLazPerf(buffer, header);
      points = result.points;
      pointCount = result.pointCount;
    } else {
      // LAS sin compresión — leer directamente
      onProgress?.({
        phase: 'DECOMPRESSING',
        percent: 20,
        message: 'Leyendo puntos LAS sin compresión...',
        pointsProcessed: 0,
        totalPoints: header.numberOfPoints,
      });
      
      const result = readLASPoints(buffer, header);
      points = result.points;
      pointCount = result.pointCount;
    }
    
    onProgress?.({
      phase: 'CLASSIFYING',
      percent: 60,
      message: 'Clasificando puntos...',
      pointsProcessed: pointCount,
      totalPoints: pointCount,
    });
    
    // Analizar puntos
    const analysis = analyzePoints(points, pointCount, header);
    
    onProgress?.({
      phase: 'ANALYZING',
      percent: 90,
      message: 'Calculando estadísticas...',
      pointsProcessed: pointCount,
      totalPoints: pointCount,
    });
    
    // Crear muestra para visualización
    const sample = createSample(points, pointCount, maxSamplePoints);
    
    const processingTimeMs = performance.now() - startTime;
    
    onProgress?.({
      phase: 'COMPLETE',
      percent: 100,
      message: `Procesamiento completado en ${(processingTimeMs / 1000).toFixed(2)}s`,
      pointsProcessed: pointCount,
      totalPoints: pointCount,
    });
    
    return {
      success: true,
      pointCount,
      groundPointCount: analysis.groundCount,
      classifiedPointCount: analysis.classifiedCount,
      unclassifiedPointCount: analysis.unclassifiedCount,
      otherPointCount: analysis.otherCount,
      bounds: analysis.bounds,
      density: analysis.density,
      classDistribution: analysis.classDistribution,
      returnDistribution: analysis.returnDistribution,
      processingTimeMs,
      samplePoints: sample,
      sampleSize: Math.min(pointCount, maxSamplePoints),
      header,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      pointCount: 0,
      groundPointCount: 0,
      classifiedPointCount: 0,
      unclassifiedPointCount: 0,
      otherPointCount: 0,
      bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0 },
      density: { pointsPerSquareMeter: 0, groundPointsPerSquareMeter: 0, area: 0 },
      classDistribution: {},
      returnDistribution: {},
      processingTimeMs: performance.now() - startTime,
      samplePoints: null,
      sampleSize: 0,
      header,
      timestamp,
      errorMessage: `Error de descompresión: ${errorMessage}`,
    };
  }
}

/**
 * Descomprime LAZ usando laz-perf.
 */
async function decompressWithLazPerf(
  buffer: ArrayBuffer,
  header: LASHeaderInfo
): Promise<{ points: Float32Array; pointCount: number }> {
  // Intentar importar laz-perf dinámicamente
  try {
    const lazPerfModule = await import('laz-perf');
    
    // laz-perf expone una API para descomprimir
    // La API exacta depende de la versión; usamos la más común
    const factory = (lazPerfModule as any).default || lazPerfModule;
    const module = typeof factory === 'function' ? await factory() : factory;
    
    // Crear descompresor para el formato de punto
    const decoder = new module.LASZip();
    
    // Obtener datos desde el offset
    const pointDataOffset = header.offsetToPointData;
    const pointData = new Uint8Array(buffer, pointDataOffset);
    
    // Descomprimir
    decoder.open(pointData);
    
    const pointCount = header.numberOfPoints;
    const pointFormat = header.pointDataRecordFormat;
    
    // Tamaño del punto según formato (aproximado)
    const pointSize = getPointSize(pointFormat);
    
    // Buffer para puntos descomprimidos
    const decompressedBuffer = new ArrayBuffer(pointCount * pointSize);
    const decompressedView = new Uint8Array(decompressedBuffer);
    
    // Leer punto por punto
    for (let i = 0; i < pointCount; i++) {
      const pointBuffer = new ArrayBuffer(pointSize);
      decoder.getPoint(pointBuffer);
      decompressedView.set(new Uint8Array(pointBuffer), i * pointSize);
    }
    
    decoder.delete();
    
    // Convertir a Float32Array con X, Y, Z, classification, returnNumber
    // 5 valores por punto
    const points = new Float32Array(pointCount * 5);
    
    for (let i = 0; i < pointCount; i++) {
      const offset = i * pointSize;
      const view = new DataView(decompressedBuffer, offset, pointSize);
      
      // Leer coordenadas como enteros y aplicar escala/offset
      const xRaw = view.getInt32(0, true);
      const yRaw = view.getInt32(4, true);
      const zRaw = view.getInt32(8, true);
      
      const x = xRaw * header.xScale + header.xOffset;
      const y = yRaw * header.yScale + header.yOffset;
      const z = zRaw * header.zScale + header.zOffset;
      
      // Classification está en offset 16 para formato 0-5, o variable para 6+
      let classification = 0;
      let returnNumber = 0;
      
      if (pointFormat <= 5) {
        const flags = view.getUint8(14);
        returnNumber = flags & 0x07;
        classification = view.getUint8(15);
      } else {
        // Formato 6+: clasificación en offset 16 (14 bits)
        const classCode = view.getUint16(16, true);
        classification = classCode & 0x3FFF;
        const flags6 = view.getUint8(14);
        returnNumber = flags6 & 0x0F;
      }
      
      const idx = i * 5;
      points[idx] = x;
      points[idx + 1] = y;
      points[idx + 2] = z;
      points[idx + 3] = classification;
      points[idx + 4] = returnNumber;
    }
    
    return { points, pointCount };
  } catch (error) {
    throw new Error(`laz-perf no disponible o error de descompresión: ${error instanceof Error ? error.message : 'desconocido'}`);
  }
}

/**
 * Lee puntos de un archivo LAS sin compresión.
 */
function readLASPoints(
  buffer: ArrayBuffer,
  header: LASHeaderInfo
): { points: Float32Array; pointCount: number } {
  const pointCount = header.numberOfPoints;
  const pointSize = header.pointDataRecordLength;
  const offset = header.offsetToPointData;
  
  const points = new Float32Array(pointCount * 5);
  const view = new DataView(buffer);
  
  for (let i = 0; i < pointCount; i++) {
    const pointOffset = offset + i * pointSize;
    
    // Leer coordenadas
    const xRaw = view.getInt32(pointOffset, true);
    const yRaw = view.getInt32(pointOffset + 4, true);
    const zRaw = view.getInt32(pointOffset + 8, true);
    
    const x = xRaw * header.xScale + header.xOffset;
    const y = yRaw * header.yScale + header.yOffset;
    const z = zRaw * header.zScale + header.zOffset;
    
    // Classification y return
    let classification = 0;
    let returnNumber = 0;
    
    if (header.pointDataRecordFormat <= 5) {
      const flags = view.getUint8(pointOffset + 14);
      returnNumber = flags & 0x07;
      classification = view.getUint8(pointOffset + 15);
    } else {
      const classCode = view.getUint16(pointOffset + 16, true);
      classification = classCode & 0x3FFF;
      const flags6 = view.getUint8(pointOffset + 14);
      returnNumber = flags6 & 0x0F;
    }
    
    const idx = i * 5;
    points[idx] = x;
    points[idx + 1] = y;
    points[idx + 2] = z;
    points[idx + 3] = classification;
    points[idx + 4] = returnNumber;
  }
  
  return { points, pointCount };
}

/**
 * Analiza los puntos descomprimidos.
 */
function analyzePoints(
  points: Float32Array,
  pointCount: number,
  header: LASHeaderInfo
): {
  groundCount: number;
  classifiedCount: number;
  unclassifiedCount: number;
  otherCount: number;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number; zMin: number; zMax: number };
  density: { pointsPerSquareMeter: number; groundPointsPerSquareMeter: number; area: number };
  classDistribution: Record<number, number>;
  returnDistribution: Record<number, number>;
} {
  let groundCount = 0;
  let classifiedCount = 0;
  let unclassifiedCount = 0;
  let otherCount = 0;
  
  let xMin = Infinity, xMax = -Infinity;
  let yMin = Infinity, yMax = -Infinity;
  let zMin = Infinity, zMax = -Infinity;
  
  const classDistribution: Record<number, number> = {};
  const returnDistribution: Record<number, number> = {};
  
  for (let i = 0; i < pointCount; i++) {
    const idx = i * 5;
    const x = points[idx];
    const y = points[idx + 1];
    const z = points[idx + 2];
    const classification = points[idx + 3];
    const returnNumber = points[idx + 4];
    
    // Bounds
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
    if (z < zMin) zMin = z;
    if (z > zMax) zMax = z;
    
    // Clasificación (ASPRS LAS specification)
    // 0: Created/Never classified
    // 1: Unclassified
    // 2: Ground
    // 3: Low Vegetation
    // 4: Medium Vegetation
    // 5: High Vegetation
    // 6: Building
    // 7: Low Point (noise)
    // 8: Reserved
    // 9: Water
    // ...
    
    const classInt = Math.round(classification);
    classDistribution[classInt] = (classDistribution[classInt] || 0) + 1;
    
    if (classInt === 2) {
      groundCount++;
      classifiedCount++;
    } else if (classInt === 0 || classInt === 1) {
      unclassifiedCount++;
    } else {
      classifiedCount++;
      otherCount++;
    }
    
    // Retornos
    const retInt = Math.round(returnNumber);
    returnDistribution[retInt] = (returnDistribution[retInt] || 0) + 1;
  }
  
  const area = (xMax - xMin) * (yMax - yMin);
  const pointsPerSquareMeter = area > 0 ? pointCount / area : 0;
  const groundPointsPerSquareMeter = area > 0 ? groundCount / area : 0;
  
  return {
    groundCount,
    classifiedCount,
    unclassifiedCount,
    otherCount,
    bounds: { xMin, xMax, yMin, yMax, zMin, zMax },
    density: { pointsPerSquareMeter, groundPointsPerSquareMeter, area },
    classDistribution,
    returnDistribution,
  };
}

/**
 * Crea una muestra de puntos para visualización.
 */
function createSample(points: Float32Array, pointCount: number, maxSample: number): Float32Array {
  const sampleSize = Math.min(pointCount, maxSample);
  const sample = new Float32Array(sampleSize * 5);
  
  if (pointCount <= maxSample) {
    sample.set(points.subarray(0, sampleSize * 5));
  } else {
    // Muestreo aleatorio uniforme
    const step = pointCount / maxSample;
    for (let i = 0; i < maxSample; i++) {
      const srcIdx = Math.floor(i * step) * 5;
      const dstIdx = i * 5;
      for (let j = 0; j < 5; j++) {
        sample[dstIdx + j] = points[srcIdx + j];
      }
    }
  }
  
  return sample;
}

/**
 * Obtiene el tamaño de punto según el formato LAS.
 */
function getPointSize(format: number): number {
  const sizes: Record<number, number> = {
    0: 20,
    1: 28,
    2: 26,
    3: 34,
    4: 57,
    5: 63,
    6: 30,
    7: 36,
    8: 38,
    9: 59,
    10: 67,
  };
  return sizes[format] || 30;
}

/**
 * Genera un DTM (Digital Terrain Model) a partir de puntos Ground.
 * Usa interpolación IDW (Inverse Distance Weighting).
 */
export function generateDTM(
  points: Float32Array,
  pointCount: number,
  resolution: number = 1.0, // metros por píxel
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number }
): {
  grid: Float32Array;
  width: number;
  height: number;
  resolution: number;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  noDataValue: number;
} {
  const width = Math.ceil((bounds.xMax - bounds.xMin) / resolution);
  const height = Math.ceil((bounds.yMax - bounds.yMin) / resolution);
  const grid = new Float32Array(width * height);
  const noDataValue = -9999;
  
  // Inicializar con NoData
  grid.fill(noDataValue);
  
  // Filtrar puntos Ground (class 2)
  const groundPoints: Array<[number, number, number]> = [];
  for (let i = 0; i < pointCount; i++) {
    const idx = i * 5;
    const classification = points[idx + 3];
    if (Math.round(classification) === 2) {
      groundPoints.push([points[idx], points[idx + 1], points[idx + 2]]);
    }
  }
  
  if (groundPoints.length === 0) {
    return { grid, width, height, resolution, bounds, noDataValue };
  }
  
  // IDW interpolation con radio de búsqueda
  const searchRadius = resolution * 5;
  const power = 2;
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const x = bounds.xMin + (col + 0.5) * resolution;
      const y = bounds.yMin + (row + 0.5) * resolution;
      
      let sumWeights = 0;
      let sumValues = 0;
      let neighborCount = 0;
      
      for (const [px, py, pz] of groundPoints) {
        const dx = px - x;
        const dy = py - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < searchRadius) {
          if (dist < 0.001) {
            // Punto muy cercano, usar directamente
            sumValues = pz;
            sumWeights = 1;
            neighborCount = 1;
            break;
          }
          const weight = 1 / Math.pow(dist, power);
          sumWeights += weight;
          sumValues += weight * pz;
          neighborCount++;
        }
      }
      
      if (neighborCount > 0) {
        grid[row * width + col] = sumValues / sumWeights;
      }
    }
  }
  
  return { grid, width, height, resolution, bounds, noDataValue };
}

/**
 * Genera hillshade a partir de un DTM.
 */
export function generateHillshade(
  dtm: { grid: Float32Array; width: number; height: number; resolution: number; noDataValue: number },
  azimuth: number = 315, // grados
  altitude: number = 45  // grados
): Float32Array {
  const { grid, width, height, resolution, noDataValue } = dtm;
  const hillshade = new Float32Array(width * height);
  
  const azimuthRad = (azimuth * Math.PI) / 180;
  const altitudeRad = (altitude * Math.PI) / 180;
  
  const sinAlt = Math.sin(altitudeRad);
  const cosAlt = Math.cos(altitudeRad);
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      
      // Verificar NoData
      if (grid[idx] === noDataValue ||
          grid[idx - 1] === noDataValue ||
          grid[idx + 1] === noDataValue ||
          grid[idx - width] === noDataValue ||
          grid[idx + width] === noDataValue) {
        hillshade[idx] = noDataValue;
        continue;
      }
      
      // Gradiente (método de Horn)
      const dzdx = ((grid[idx + 1] - grid[idx - 1]) + 
                    (grid[idx - width + 1] - grid[idx - width - 1]) +
                    (grid[idx + width + 1] - grid[idx + width - 1])) / (8 * resolution);
      
      const dzdy = ((grid[idx + width] - grid[idx - width]) + 
                    (grid[idx + width + 1] - grid[idx - width + 1]) +
                    (grid[idx + width - 1] - grid[idx - width - 1])) / (8 * resolution);
      
      const slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
      const aspect = Math.atan2(-dzdy, dzdx);
      
      const hs = sinAlt + cosAlt * Math.cos(azimuthRad - aspect) * Math.cos(slope);
      hillshade[idx] = Math.max(0, Math.min(255, hs * 255));
    }
  }
  
  return hillshade;
}

/**
 * Genera mapa de pendiente a partir de un DTM.
 */
export function generateSlope(
  dtm: { grid: Float32Array; width: number; height: number; resolution: number; noDataValue: number }
): Float32Array {
  const { grid, width, height, resolution, noDataValue } = dtm;
  const slope = new Float32Array(width * height);
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      
      if (grid[idx] === noDataValue ||
          grid[idx - 1] === noDataValue ||
          grid[idx + 1] === noDataValue ||
          grid[idx - width] === noDataValue ||
          grid[idx + width] === noDataValue) {
        slope[idx] = noDataValue;
        continue;
      }
      
      const dzdx = (grid[idx + 1] - grid[idx - 1]) / (2 * resolution);
      const dzdy = (grid[idx + width] - grid[idx - width]) / (2 * resolution);
      
      const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
      slope[idx] = (slopeRad * 180) / Math.PI; // grados
    }
  }
  
  return slope;
}
