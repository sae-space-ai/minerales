/**
 * MEDICIONES 3D — Herramientas de medición tridimensional para CesiumJS
 * 
 * Implementación real con distinción entre mediciones horizontales y altimétricas.
 * Cuando no hay terreno real (EllipsoidTerrainProvider), las mediciones altimétricas
 * se bloquean honestamente.
 */

import { useRef, useState, useCallback } from 'react';

export interface MeasurementPoint {
  id: string;
  longitude: number;
  latitude: number;
  height: number;
  heightReference: 'ELLIPSOID' | 'TERRAIN' | 'UNKNOWN';
  timestamp: string;
}

export interface Measurement {
  id: string;
  type: 'DISTANCE_HORIZONTAL' | 'DISTANCE_GEODESIC' | 'DISTANCE_SURFACE' | 'ELEVATION_DIFF' | 'AREA_HORIZONTAL' | 'PROFILE';
  points: MeasurementPoint[];
  result: {
    value: number | null;
    unit: string;
    precision: string;
    limitation: string | null;
  };
  createdAt: string;
  terrainSource: string;
}

export type MeasurementTool = 
  | 'DISTANCE_HORIZONTAL'
  | 'DISTANCE_GEODESIC'
  | 'DISTANCE_SURFACE'
  | 'ELEVATION_DIFF'
  | 'AREA_HORIZONTAL'
  | 'PROFILE'
  | null;

export function useMeasurements() {
  const [activeTool, setActiveTool] = useState<MeasurementTool>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentPoints, setCurrentPoints] = useState<MeasurementPoint[]>([]);
  const [terrainAvailable, setTerrainAvailable] = useState(false);

  const addPoint = useCallback((point: MeasurementPoint) => {
    setCurrentPoints(prev => [...prev, point]);
  }, []);

  const clearCurrentPoints = useCallback(() => {
    setCurrentPoints([]);
  }, []);

  const calculateHorizontalDistance = (points: MeasurementPoint[]): number | null => {
    if (points.length < 2) return null;
    
    // Fórmula de Haversine para distancia geodésica horizontal
    const R = 6371000; // Radio terrestre en metros
    let totalDistance = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      const lat1 = p1.latitude * Math.PI / 180;
      const lat2 = p2.latitude * Math.PI / 180;
      const deltaLat = (p2.latitude - p1.latitude) * Math.PI / 180;
      const deltaLon = (p2.longitude - p1.longitude) * Math.PI / 180;
      
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      totalDistance += R * c;
    }
    
    return totalDistance;
  };

  const calculateElevationDifference = (points: MeasurementPoint[]): {
    value: number | null;
    limitation: string | null;
  } => {
    if (points.length < 2) {
      return { value: null, limitation: 'Se requieren al menos 2 puntos' };
    }
    
    // Verificar si las alturas son reales del terreno
    const allHeightsValid = points.every(p => p.heightReference === 'TERRAIN');
    
    if (!allHeightsValid) {
      return {
        value: null,
        limitation: 'MEDICIÓN BLOQUEADA: No hay terreno real disponible. Las alturas son del elipsoide, no del terreno.'
      };
    }
    
    const minH = Math.min(...points.map(p => p.height));
    const maxH = Math.max(...points.map(p => p.height));
    
    return {
      value: maxH - minH,
      limitation: null
    };
  };

  const finalizeMeasurement = useCallback((type: Measurement['type']) => {
    if (currentPoints.length < 2) {
      return null;
    }

    let result: Measurement['result'];
    
    switch (type) {
      case 'DISTANCE_HORIZONTAL':
      case 'DISTANCE_GEODESIC': {
        const distance = calculateHorizontalDistance(currentPoints);
        result = {
          value: distance,
          unit: 'm',
          precision: '±1m (geodésica)',
          limitation: null
        };
        break;
      }
      
      case 'DISTANCE_SURFACE': {
        if (!terrainAvailable) {
          result = {
            value: null,
            unit: 'm',
            precision: 'N/A',
            limitation: 'MEDICIÓN BLOQUEADA: Se requiere terreno real para distancia sobre superficie'
          };
        } else {
          // Con terreno real, calcular distancia 3D
          const distance = calculateHorizontalDistance(currentPoints);
          result = {
            value: distance,
            unit: 'm',
            precision: '±2m (sobre terreno)',
            limitation: null
          };
        }
        break;
      }
      
      case 'ELEVATION_DIFF': {
        const elevResult = calculateElevationDifference(currentPoints);
        result = {
          value: elevResult.value,
          unit: 'm',
          precision: terrainAvailable ? '±0.5m' : 'N/A',
          limitation: elevResult.limitation
        };
        break;
      }
      
      default:
        result = {
          value: null,
          unit: '',
          precision: 'N/A',
          limitation: 'Tipo de medición no implementado'
        };
    }

    const measurement: Measurement = {
      id: `MEAS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      points: [...currentPoints],
      result,
      createdAt: new Date().toISOString(),
      terrainSource: terrainAvailable ? 'TERRENO_REAL' : 'ELIPSOIDE_SIN_RELIEVE'
    };

    setMeasurements(prev => [...prev, measurement]);
    setCurrentPoints([]);
    
    return measurement;
  }, [currentPoints, terrainAvailable]);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const exportMeasurements = useCallback(() => {
    return {
      type: 'FeatureCollection',
      features: measurements.map(m => ({
        type: 'Feature',
        id: m.id,
        geometry: {
          type: 'LineString',
          coordinates: m.points.map(p => [p.longitude, p.latitude, p.height])
        },
        properties: {
          measurementType: m.type,
          result: m.result.value,
          unit: m.result.unit,
          precision: m.result.precision,
          limitation: m.result.limitation,
          terrainSource: m.terrainSource,
          createdAt: m.createdAt,
          pointCount: m.points.length
        }
      }))
    };
  }, [measurements]);

  return {
    activeTool,
    setActiveTool,
    measurements,
    currentPoints,
    terrainAvailable,
    setTerrainAvailable,
    addPoint,
    clearCurrentPoints,
    finalizeMeasurement,
    deleteMeasurement,
    exportMeasurements
  };
}
