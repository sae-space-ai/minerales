/**
 * MICROCELL-1M2 — Sistema de microceldas geoespaciales.
 * 
 * Define unidades de investigación de superficie real.
 * Utiliza EPSG:25829 (ETRS89 / UTM 29N) como CRS métrico de referencia.
 */

import { utmToWgs84, wgs84ToUtm } from './coordinates';

export type MicrocellSize = 0.25 | 1 | 4 | 25 | 100;

export interface MicrocellGeometry {
  id: string;
  centerUTM: { x: number; y: number };
  centerWGS84: { lat: number; lon: number };
  cornersUTM: Array<{ x: number; y: number }>;
  cornersWGS84: Array<{ lat: number; lon: number }>;
  size: MicrocellSize;
  sideLength: number; // metros
  area: number; // m²
  crsOriginal: 'EPSG:25829';
  crsDisplay: 'EPSG:4326';
  createdAt: string;
  tolerance: number; // metros
}

export interface MicrocellSourceInfo {
  source: string;
  resolution: number | null; // metros por píxel
  coverage: 'FULL' | 'PARTIAL' | 'NONE';
  classification: 'ADEQUATE_FOR_SELECTED_ANALYSIS' | 'LIMITED_RESOLUTION' | 'INSUFFICIENT_RESOLUTION' | 'NO_COVERAGE' | 'NOT_VERIFIED';
  pixelsInCell: number | null;
  validSamples: number | null;
  notes: string;
}

export interface MicrocellScientificCard {
  id: string;
  geometry: MicrocellGeometry;
  sources: {
    orthophoto: MicrocellSourceInfo | null;
    satellite: MicrocellSourceInfo | null;
    lidar: MicrocellSourceInfo | null;
    dtm: MicrocellSourceInfo | null;
    geology: MicrocellSourceInfo | null;
  };
  lidarStats: {
    totalReturns: number | null;
    groundReturns: number | null;
    firstReturns: number | null;
    lastReturns: number | null;
    densityPerM2: number | null;
    minZ: number | null;
    maxZ: number | null;
    elevationRange: number | null;
  };
  dtmStats: {
    minElevation: number | null;
    maxElevation: number | null;
    slope: number | null;
    aspect: number | null;
    cellsInArea: number | null;
  };
  limitations: string[];
  reviewStatus: 'NOT_REVIEWED' | 'UNDER_REVIEW' | 'REVIEWED';
  createdAt: string;
}

/**
 * Crea una microcelda de 1m² (u otro tamaño) alrededor de un punto central.
 * 
 * IMPORTANTE: El cálculo se realiza en coordenadas UTM (metros),
 * no en grados de latitud/longitud, para garantizar precisión métrica.
 */
export function createMicrocell(
  centerLat: number,
  centerLon: number,
  size: MicrocellSize = 1,
  crsEPSG: 25829 | 25830 = 25829
): MicrocellGeometry {
  // Transformar centro a UTM
  const centerUTM = wgs84ToUtm(centerLat, centerLon, crsEPSG);
  
  // Calcular lado del cuadrado
  const sideLength = Math.sqrt(size);
  const halfSide = sideLength / 2;
  
  // Calcular esquinas en UTM (metros, no grados)
  const cornersUTM = [
    { x: centerUTM.easting - halfSide, y: centerUTM.northing - halfSide }, // SW
    { x: centerUTM.easting + halfSide, y: centerUTM.northing - halfSide }, // SE
    { x: centerUTM.easting + halfSide, y: centerUTM.northing + halfSide }, // NE
    { x: centerUTM.easting - halfSide, y: centerUTM.northing + halfSide }, // NW
  ];
  
  // Transformar esquinas a WGS84
  const cornersWGS84 = cornersUTM.map(c => {
    const wgs = utmToWgs84(c.x, c.y, crsEPSG);
    return { lat: wgs.lat, lon: wgs.lon };
  });
  
  // Verificar área real (debe ser exactamente size m² en UTM)
  const computedArea = sideLength * sideLength;
  const tolerance = 0.0001; // 0.01 cm²
  
  if (Math.abs(computedArea - size) > tolerance) {
    console.warn(`Área calculada ${computedArea} difiere del objetivo ${size}`);
  }
  
  return {
    id: `MICROCELL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    centerUTM: { x: centerUTM.easting, y: centerUTM.northing },
    centerWGS84: { lat: centerLat, lon: centerLon },
    cornersUTM,
    cornersWGS84,
    size,
    sideLength,
    area: computedArea,
    crsOriginal: 'EPSG:25829',
    crsDisplay: 'EPSG:4326',
    createdAt: new Date().toISOString(),
    tolerance,
  };
}

/**
 * Crea una cuadrícula de microceldas contiguas.
 */
export function createMicrocellGrid(
  centerLat: number,
  centerLon: number,
  gridSize: number, // número de microceldas por lado
  cellSize: MicrocellSize = 1,
  crsEPSG: 25829 | 25830 = 25829
): MicrocellGeometry[] {
  const centerUTM = wgs84ToUtm(centerLat, centerLon, crsEPSG);
  const sideLength = Math.sqrt(cellSize);
  const totalWidth = gridSize * sideLength;
  const startX = centerUTM.easting - totalWidth / 2 + sideLength / 2;
  const startY = centerUTM.northing - totalWidth / 2 + sideLength / 2;
  
  const cells: MicrocellGeometry[] = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cellX = startX + col * sideLength;
      const cellY = startY + row * sideLength;
      const cellWGS = utmToWgs84(cellX, cellY, crsEPSG);
      cells.push(createMicrocell(cellWGS.lat, cellWGS.lon, cellSize, crsEPSG));
    }
  }
  
  return cells;
}

/**
 * Clasifica la idoneidad de una fuente para una microcelda.
 */
export function classifySourceResolution(
  sourceResolution: number | null,
  cellSize: MicrocellSize
): MicrocellSourceInfo['classification'] {
  if (sourceResolution === null) {
    return 'NOT_VERIFIED';
  }
  
  // La fuente debe tener al menos 4 píxeles en la microcelda para ser útil
  const pixelsPerSide = Math.sqrt(cellSize) / sourceResolution;
  
  if (pixelsPerSide >= 4) {
    return 'ADEQUATE_FOR_SELECTED_ANALYSIS';
  } else if (pixelsPerSide >= 1) {
    return 'LIMITED_RESOLUTION';
  } else {
    return 'INSUFFICIENT_RESOLUTION';
  }
}

/**
 * Calcula estadísticas LiDAR para una microcelda.
 * Requiere puntos descomprimidos con coordenadas UTM.
 */
export function computeLidarStatsForMicrocell(
  points: Float32Array,
  pointCount: number,
  microcell: MicrocellGeometry
): MicrocellScientificCard['lidarStats'] {
  const { cornersUTM } = microcell;
  const xMin = Math.min(cornersUTM[0].x, cornersUTM[3].x);
  const xMax = Math.max(cornersUTM[1].x, cornersUTM[2].x);
  const yMin = Math.min(cornersUTM[0].y, cornersUTM[1].y);
  const yMax = Math.max(cornersUTM[2].y, cornersUTM[3].y);
  
  let totalReturns = 0;
  let groundReturns = 0;
  let firstReturns = 0;
  let lastReturns = 0;
  let minZ = Infinity;
  let maxZ = -Infinity;
  
  for (let i = 0; i < pointCount; i++) {
    const idx = i * 5;
    const x = points[idx];
    const y = points[idx + 1];
    const z = points[idx + 2];
    const classification = points[idx + 3];
    const returnNumber = points[idx + 4];
    
    // Verificar si el punto está dentro de la microcelda
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
      totalReturns++;
      
      if (Math.round(classification) === 2) groundReturns++;
      if (Math.round(returnNumber) === 1) firstReturns++;
      
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }
  
  if (totalReturns === 0) {
    return {
      totalReturns: 0,
      groundReturns: 0,
      firstReturns: 0,
      lastReturns: 0,
      densityPerM2: 0,
      minZ: null,
      maxZ: null,
      elevationRange: null,
    };
  }
  
  return {
    totalReturns,
    groundReturns,
    firstReturns,
    lastReturns: totalReturns - firstReturns,
    densityPerM2: totalReturns / microcell.area,
    minZ: minZ === Infinity ? null : minZ,
    maxZ: maxZ === -Infinity ? null : maxZ,
    elevationRange: (minZ !== Infinity && maxZ !== -Infinity) ? maxZ - minZ : null,
  };
}

/**
 * Genera una ficha científica completa para una microcelda.
 */
export function generateScientificCard(
  microcell: MicrocellGeometry,
  lidarPoints: Float32Array | null,
  lidarPointCount: number
): MicrocellScientificCard {
  const lidarStats = lidarPoints
    ? computeLidarStatsForMicrocell(lidarPoints, lidarPointCount, microcell)
    : {
        totalReturns: null,
        groundReturns: null,
        firstReturns: null,
        lastReturns: null,
        densityPerM2: null,
        minZ: null,
        maxZ: null,
        elevationRange: null,
      };
  
  const limitations: string[] = [];
  
  if (lidarStats.totalReturns === 0) {
    limitations.push('INSUFFICIENT_POINT_DENSITY: No hay retornos LiDAR en la microcelda.');
  } else if (lidarStats.totalReturns !== null && lidarStats.totalReturns < 4) {
    limitations.push('LOW_POINT_DENSITY: Menos de 4 retornos. Análisis estadístico no fiable.');
  }
  
  if (lidarStats.groundReturns === 0 && lidarStats.totalReturns !== null && lidarStats.totalReturns > 0) {
    limitations.push('NO_GROUND_CLASSIFICATION: No hay puntos clasificados como suelo.');
  }
  
  return {
    id: microcell.id,
    geometry: microcell,
    sources: {
      orthophoto: null, // Se rellena con datos reales cuando estén disponibles
      satellite: null,
      lidar: lidarPoints ? {
        source: 'PNOA LiDAR (archivo cargado)',
        resolution: null, // LiDAR no tiene resolución de píxel fija
        coverage: lidarStats.totalReturns && lidarStats.totalReturns > 0 ? 'FULL' : 'NONE',
        classification: lidarStats.totalReturns && lidarStats.totalReturns >= 4
          ? 'ADEQUATE_FOR_SELECTED_ANALYSIS'
          : 'INSUFFICIENT_RESOLUTION',
        pixelsInCell: lidarStats.totalReturns,
        validSamples: lidarStats.groundReturns,
        notes: 'Puntos LiDAR reales del archivo cargado',
      } : null,
      dtm: null,
      geology: null,
    },
    lidarStats,
    dtmStats: {
      minElevation: lidarStats.minZ,
      maxElevation: lidarStats.maxZ,
      slope: null,
      aspect: null,
      cellsInArea: null,
    },
    limitations,
    reviewStatus: 'NOT_REVIEWED',
    createdAt: new Date().toISOString(),
  };
}
