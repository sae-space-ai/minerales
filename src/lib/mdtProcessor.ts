/**
 * Procesador de MDT (Modelo Digital del Terreno) usando geotiff.js.
 * 
 * Desbloquea: importación de GeoTIFF/COG oficiales del IGN-CNIG,
 * generación de hillshade, pendiente, curvatura, detección geomorfológica.
 */

export interface MDTData {
  grid: Float32Array;
  width: number;
  height: number;
  resolution: number; // metros por píxel
  bounds: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  noDataValue: number;
  crs: string;
  source: string;
  timestamp: string;
  checksumSHA256?: string;
}

export interface MDTLoadResult {
  success: boolean;
  mdt: MDTData | null;
  errorMessage?: string;
  processingTimeMs: number;
}

/**
 * Carga un archivo GeoTIFF y extrae el MDT.
 */
export async function loadMDTFromFile(
  file: File,
  targetEPSG: number = 25829
): Promise<MDTLoadResult> {
  const startTime = performance.now();
  
  try {
    const geotiff = await import('geotiff');
    const arrayBuffer = await file.arrayBuffer();
    
    const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    
    const width = image.getWidth();
    const height = image.getHeight();
    
    // Obtener bounds geográficos
    const bbox = image.getBoundingBox();
    const [xMin, yMin, xMax, yMax] = bbox;
    
    // Obtener NoData
    const noDataValue = image.getGDALNoData() ?? -9999;
    
    // Leer datos raster
    const data = await image.readRasters({
      interleave: false,
    });
    
    // geotiff devuelve un array de arrays (uno por banda)
    const band0 = data[0];
    const grid = new Float32Array(width * height);
    
    for (let i = 0; i < width * height; i++) {
      grid[i] = band0[i];
    }
    
    // Resolución
    const resolution = (xMax - xMin) / width;
    
    // CRS (intentar detectar)
    let crs = `EPSG:${targetEPSG}`;
    try {
      const imgAny = image as any;
      const geoKeys = imgAny.geoKeys || imgAny.getGeoKeys?.();
      if (geoKeys && geoKeys.ProjectedCSTypeGeoKey) {
        crs = `EPSG:${geoKeys.ProjectedCSTypeGeoKey}`;
      }
    } catch {
      // CRS no detectado, usar el proporcionado
    }
    
    const processingTimeMs = performance.now() - startTime;
    
    return {
      success: true,
      mdt: {
        grid,
        width,
        height,
        resolution,
        bounds: { xMin, yMin, xMax, yMax },
        noDataValue,
        crs,
        source: file.name,
        timestamp: new Date().toISOString(),
      },
      processingTimeMs,
    };
  } catch (error) {
    return {
      success: false,
      mdt: null,
      errorMessage: error instanceof Error ? error.message : 'Error desconocido',
      processingTimeMs: performance.now() - startTime,
    };
  }
}

/**
 * Genera hillshade a partir de un MDT.
 */
export function generateHillshadeFromMDT(
  mdt: MDTData,
  azimuth: number = 315,
  altitude: number = 45
): Float32Array {
  const { grid, width, height, resolution, noDataValue } = mdt;
  const hillshade = new Float32Array(width * height);
  
  const azimuthRad = (azimuth * Math.PI) / 180;
  const altitudeRad = (altitude * Math.PI) / 180;
  const sinAlt = Math.sin(altitudeRad);
  const cosAlt = Math.cos(altitudeRad);
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      
      if (grid[idx] === noDataValue ||
          grid[idx - 1] === noDataValue ||
          grid[idx + 1] === noDataValue ||
          grid[idx - width] === noDataValue ||
          grid[idx + width] === noDataValue) {
        hillshade[idx] = noDataValue;
        continue;
      }
      
      // Gradiente (Horn)
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
 * Genera mapa de pendiente a partir de un MDT.
 */
export function generateSlopeFromMDT(mdt: MDTData): Float32Array {
  const { grid, width, height, resolution, noDataValue } = mdt;
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
      slope[idx] = (slopeRad * 180) / Math.PI;
    }
  }
  
  return slope;
}

/**
 * Genera curvatura (Laplaciana) a partir de un MDT.
 */
export function generateCurvatureFromMDT(mdt: MDTData): Float32Array {
  const { grid, width, height, resolution, noDataValue } = mdt;
  const curvature = new Float32Array(width * height);
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      
      if (grid[idx] === noDataValue ||
          grid[idx - 1] === noDataValue ||
          grid[idx + 1] === noDataValue ||
          grid[idx - width] === noDataValue ||
          grid[idx + width] === noDataValue) {
        curvature[idx] = noDataValue;
        continue;
      }
      
      // Laplaciana (curvatura media)
      const d2zdx2 = (grid[idx + 1] - 2 * grid[idx] + grid[idx - 1]) / (resolution * resolution);
      const d2zdy2 = (grid[idx + width] - 2 * grid[idx] + grid[idx - width]) / (resolution * resolution);
      
      curvature[idx] = -2 * (d2zdx2 + d2zdy2) * 100; // factor de escala para visualización
    }
  }
  
  return curvature;
}

/**
 * Detecta depresiones (sumideros) en un MDT.
 * Una depresión es un píxel más bajo que todos sus vecinos.
 */
export function detectDepressions(
  mdt: MDTData,
  minDepth: number = 1.5,
  minArea: number = 25
): Array<{
  id: string;
  center: [number, number];
  depth: number;
  area: number;
  pixels: number[];
}> {
  const { grid, width, height, resolution, noDataValue, bounds } = mdt;
  const visited = new Set<number>();
  const depressions: Array<{
    id: string;
    center: [number, number];
    depth: number;
    area: number;
    pixels: number[];
  }> = [];
  
  let depressionCount = 0;
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      
      if (visited.has(idx) || grid[idx] === noDataValue) continue;
      
      // Verificar si es un mínimo local
      const neighbors = [
        grid[idx - 1], grid[idx + 1],
        grid[idx - width], grid[idx + width],
        grid[idx - width - 1], grid[idx - width + 1],
        grid[idx + width - 1], grid[idx + width + 1],
      ];
      
      const isLocalMin = neighbors.every(n => n !== noDataValue && n > grid[idx]);
      
      if (!isLocalMin) continue;
      
      // Flood fill para encontrar el área de la depresión
      const pixels: number[] = [];
      const queue = [idx];
      const centerZ = grid[idx];
      let rimZ = Infinity;
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        
        const crow = Math.floor(current / width);
        const ccol = current % width;
        
        if (grid[current] !== noDataValue) {
          pixels.push(current);
          
          // Expandir a vecinos
          const neighborOffsets = [-1, 1, -width, width];
          for (const offset of neighborOffsets) {
            const nIdx = current + offset;
            if (nIdx >= 0 && nIdx < width * height && !visited.has(nIdx)) {
              const nRow = Math.floor(nIdx / width);
              const nCol = nIdx % width;
              if (nRow >= 0 && nRow < height && nCol >= 0 && nCol < width) {
                if (grid[nIdx] !== noDataValue && grid[nIdx] <= grid[current] + minDepth) {
                  queue.push(nIdx);
                } else if (grid[nIdx] !== noDataValue) {
                  rimZ = Math.min(rimZ, grid[nIdx]);
                }
              }
            }
          }
        }
      }
      
      const depth = rimZ !== Infinity ? rimZ - centerZ : 0;
      const area = pixels.length * resolution * resolution;
      
      if (depth >= minDepth && area >= minArea) {
        depressionCount++;
        // Centroide
        let sumX = 0, sumY = 0;
        for (const p of pixels) {
          const pRow = Math.floor(p / width);
          const pCol = p % width;
          sumX += bounds.xMin + (pCol + 0.5) * resolution;
          sumY += bounds.yMin + (pRow + 0.5) * resolution;
        }
        const centerX = sumX / pixels.length;
        const centerY = sumY / pixels.length;
        
        depressions.push({
          id: `DEP-${String(depressionCount).padStart(3, '0')}`,
          center: [centerX, centerY],
          depth,
          area,
          pixels,
        });
      }
    }
  }
  
  return depressions;
}

/**
 * Detecta estructuras lineales (zanjas, trincheras) usando análisis de dirección.
 */
export function detectLinearStructures(
  mdt: MDTData,
  minDepth: number = 1.0,
  minLength: number = 20
): Array<{
  id: string;
  startPoint: [number, number];
  endPoint: [number, number];
  length: number;
  depth: number;
  orientation: number;
}> {
  // Simplificación: detectar líneas de baja elevación conectadas
  // En una implementación completa, se usaría skeletonización o Hough transform
  const { grid, width, height, resolution, bounds, noDataValue } = mdt;
  const structures: Array<{
    id: string;
    startPoint: [number, number];
    endPoint: [number, number];
    length: number;
    depth: number;
    orientation: number;
  }> = [];
  
  // Calcular pendiente para identificar zonas bajas lineales
  const slope = generateSlopeFromMDT(mdt);
  
  // Buscar píxeles con pendiente alta y elevación baja relativa
  const threshold = minDepth;
  const candidates: number[] = [];
  
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const idx = row * width + col;
      if (grid[idx] === noDataValue) continue;
      
      // Comparar con vecinos
      const localMin = Math.min(
        grid[idx - 1], grid[idx + 1],
        grid[idx - width], grid[idx + width]
      );
      
      if (grid[idx] < localMin - threshold && slope[idx] > 10) {
        candidates.push(idx);
      }
    }
  }
  
  // Agrupar candidatos conectados
  if (candidates.length > 10) {
    let structureCount = 0;
    // Simplificación: tomar los primeros candidatos como un grupo
    const first = candidates[0];
    const last = candidates[candidates.length - 1];
    
    const firstRow = Math.floor(first / width);
    const firstCol = first % width;
    const lastRow = Math.floor(last / width);
    const lastCol = last % width;
    
    const x1 = bounds.xMin + (firstCol + 0.5) * resolution;
    const y1 = bounds.yMin + (firstRow + 0.5) * resolution;
    const x2 = bounds.xMin + (lastCol + 0.5) * resolution;
    const y2 = bounds.yMin + (lastRow + 0.5) * resolution;
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    
    if (length >= minLength) {
      structureCount++;
      const orientation = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      
      structures.push({
        id: `LIN-${String(structureCount).padStart(3, '0')}`,
        startPoint: [x1, y1],
        endPoint: [x2, y2],
        length,
        depth: minDepth,
        orientation,
      });
    }
  }
  
  return structures;
}
