/**
 * TIMELINE SATELITAL — Selector temporal para observaciones satelitales
 * 
 * Implementación real que trabaja con fechas verificadas de servicios oficiales.
 * No interpola imágenes ni inventa instantes temporales.
 */

import { useState, useCallback } from 'react';

export interface TemporalInstant {
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  source: string;
  layerId: string;
  available: boolean;
}

export interface TemporalLayer {
  id: string;
  name: string;
  source: string;
  timeDimension: boolean;
  instants: TemporalInstant[];
  timeRange: {
    start: string | null;
    end: string | null;
    interval: string | null; // ISO 8601 duration
  };
}

export interface TimelineState {
  activeLayerId: string | null;
  selectedInstant: TemporalInstant | null;
  comparisonMode: boolean;
  comparisonInstantA: TemporalInstant | null;
  comparisonInstantB: TemporalInstant | null;
  playback: {
    playing: boolean;
    speed: number; // seconds per frame
    currentIndex: number;
  };
}

export function useSatelliteTimeline() {
  const [layers, setLayers] = useState<TemporalLayer[]>([]);
  const [state, setState] = useState<TimelineState>({
    activeLayerId: null,
    selectedInstant: null,
    comparisonMode: false,
    comparisonInstantA: null,
    comparisonInstantB: null,
    playback: {
      playing: false,
      speed: 1,
      currentIndex: 0
    }
  });

  const registerLayer = useCallback((layer: TemporalLayer) => {
    setLayers(prev => {
      const exists = prev.find(l => l.id === layer.id);
      if (exists) {
        return prev.map(l => l.id === layer.id ? layer : l);
      }
      return [...prev, layer];
    });
  }, []);

  const selectLayer = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.timeDimension) {
      setState(prev => ({
        ...prev,
        activeLayerId: null,
        selectedInstant: null
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      activeLayerId: layerId,
      selectedInstant: layer.instants[0] || null,
      playback: { ...prev.playback, currentIndex: 0 }
    }));
  }, [layers]);

  const selectInstant = useCallback((instant: TemporalInstant) => {
    setState(prev => ({
      ...prev,
      selectedInstant: instant
    }));
  }, []);

  const selectNextInstant = useCallback(() => {
    if (!state.activeLayerId) return;
    
    const layer = layers.find(l => l.id === state.activeLayerId);
    if (!layer || layer.instants.length === 0) return;

    const currentIndex = state.playback.currentIndex;
    const nextIndex = (currentIndex + 1) % layer.instants.length;
    
    setState(prev => ({
      ...prev,
      selectedInstant: layer.instants[nextIndex],
      playback: { ...prev.playback, currentIndex: nextIndex }
    }));
  }, [state.activeLayerId, state.playback.currentIndex, layers]);

  const selectPreviousInstant = useCallback(() => {
    if (!state.activeLayerId) return;
    
    const layer = layers.find(l => l.id === state.activeLayerId);
    if (!layer || layer.instants.length === 0) return;

    const currentIndex = state.playback.currentIndex;
    const prevIndex = currentIndex === 0 ? layer.instants.length - 1 : currentIndex - 1;
    
    setState(prev => ({
      ...prev,
      selectedInstant: layer.instants[prevIndex],
      playback: { ...prev.playback, currentIndex: prevIndex }
    }));
  }, [state.activeLayerId, state.playback.currentIndex, layers]);

  const setComparisonMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      comparisonMode: enabled,
      comparisonInstantA: enabled ? prev.selectedInstant : null,
      comparisonInstantB: enabled ? null : null
    }));
  }, []);

  const setComparisonInstantA = useCallback((instant: TemporalInstant | null) => {
    setState(prev => ({
      ...prev,
      comparisonInstantA: instant
    }));
  }, []);

  const setComparisonInstantB = useCallback((instant: TemporalInstant | null) => {
    setState(prev => ({
      ...prev,
      comparisonInstantB: instant
    }));
  }, []);

  const startPlayback = useCallback((speed: number = 1) => {
    setState(prev => ({
      ...prev,
      playback: { ...prev.playback, playing: true, speed }
    }));
  }, []);

  const stopPlayback = useCallback(() => {
    setState(prev => ({
      ...prev,
      playback: { ...prev.playback, playing: false }
    }));
  }, []);

  const getAvailableInstants = useCallback((): TemporalInstant[] => {
    if (!state.activeLayerId) return [];
    const layer = layers.find(l => l.id === state.activeLayerId);
    return layer?.instants || [];
  }, [state.activeLayerId, layers]);

  const getCurrentLayerInfo = useCallback((): TemporalLayer | null => {
    if (!state.activeLayerId) return null;
    return layers.find(l => l.id === state.activeLayerId) || null;
  }, [state.activeLayerId, layers]);

  return {
    layers,
    state,
    registerLayer,
    selectLayer,
    selectInstant,
    selectNextInstant,
    selectPreviousInstant,
    setComparisonMode,
    setComparisonInstantA,
    setComparisonInstantB,
    startPlayback,
    stopPlayback,
    getAvailableInstants,
    getCurrentLayerInfo
  };
}

/**
 * Genera instantes temporales a partir de una dimensión temporal ISO 8601
 * 
 * Formato: "start/end/interval"
 * Ejemplo: "2020-09-01T00:00:00Z/2026-10-11T05:45:00Z/PT15M"
 */
export function parseTimeDimension(
  timeDimension: string,
  source: string,
  layerId: string,
  maxInstants: number = 100
): TemporalInstant[] {
  const parts = timeDimension.split('/');
  if (parts.length !== 3) return [];

  const [startStr, endStr, intervalStr] = parts;
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

  // Parsear intervalo ISO 8601 (PT15M = 15 minutos, PT1H = 1 hora, etc.)
  const intervalMs = parseISO8601Duration(intervalStr);
  if (intervalMs <= 0) return [];

  const instants: TemporalInstant[] = [];
  let current = start;
  let count = 0;

  while (current <= end && count < maxInstants) {
    instants.push({
      timestamp: current.toISOString(),
      date: current.toISOString().split('T')[0],
      time: current.toISOString().split('T')[1].split('.')[0],
      source,
      layerId,
      available: true
    });
    
    current = new Date(current.getTime() + intervalMs);
    count++;
  }

  return instants;
}

/**
 * Parsea una duración ISO 8601 a milisegundos
 * 
 * Soporta: PT15M (15 min), PT1H (1 hora), P1D (1 día), etc.
 */
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const days = parseInt(match[1] || '0');
  const hours = parseInt(match[2] || '0');
  const minutes = parseInt(match[3] || '0');
  const seconds = parseInt(match[4] || '0');

  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000 + seconds * 1000;
}
