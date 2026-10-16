/**
 * GlobeControlsPanel - Panel de controles para Globe3D
 * 
 * FASE 6.1D: Controles externos conectados a Globe3D mediante ref
 * - Se integra en el panel lateral del AppShell
 * - NO es un panel flotante sobre el visor
 * - Todos los botones están conectados a funciones reales
 */

import { useState } from 'react';
import { Globe3DHandle } from './Globe3D';
import { BASE_IMAGERY_PROVIDERS, PILOT_AREA } from '../lib/cesiumConfig';
import { Search, Home, Layers, MapPin, Mountain, Globe } from 'lucide-react';

interface GlobeControlsPanelProps {
  globeRef: React.RefObject<Globe3DHandle | null>;
}

export default function GlobeControlsPanel({ globeRef }: GlobeControlsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayers, setActiveLayers] = useState({
    eumetsat: false,
    ignPnoa: false,
    igmeGeology: false,
    terrain: false,
  });
  const [baseImagery, setBaseImagery] = useState<keyof typeof BASE_IMAGERY_PROVIDERS>('ESRI_WORLD_IMAGERY');

  const handleSearch = () => {
    if (!globeRef.current || !searchQuery.trim()) return;
    
    // Intentar parsear coordenadas
    const coordMatch = searchQuery.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      globeRef.current.flyToLocation(lat, lon, 5000);
    } else {
      // Búsqueda por nombre (limitada - solo coordenadas por ahora)
      console.warn('Búsqueda por nombre no implementada - use coordenadas: lat, lon');
    }
  };

  const handleResetView = () => {
    globeRef.current?.resetView();
  };

  const handleToggleLayer = (layer: 'eumetsat' | 'ignPnoa' | 'igmeGeology' | 'terrain') => {
    globeRef.current?.toggleLayer(layer);
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleBaseImageryChange = (provider: keyof typeof BASE_IMAGERY_PROVIDERS) => {
    globeRef.current?.setBaseImagery(provider);
    setBaseImagery(provider);
  };

  const cameraInfo = globeRef.current?.getCameraInfo() || {
    lat: PILOT_AREA.center.lat,
    lon: PILOT_AREA.center.lon,
    height: PILOT_AREA.center.height,
  };

  const terrainStatus = globeRef.current?.getTerrainStatus() || 'ELLIPSOID';

  return (
    <div className="p-4 space-y-4">
      {/* Título */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
        <Globe className="w-5 h-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-white">Controles del Globo 3D</h2>
      </div>

      {/* Búsqueda */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium">Buscar Ubicación</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="lat, lon (ej: 40.4168, -3.7038)"
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/50 rounded text-xs text-blue-200 transition-colors"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-500">
          Formato: latitud, longitud (WGS84)
        </p>
      </div>

      {/* Navegación rápida */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium">Navegación</label>
        <button
          onClick={handleResetView}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-colors"
        >
          <Home className="w-4 h-4" />
          Restablecer Vista
        </button>
      </div>

      {/* Capa Base */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
          <Layers className="w-3 h-3" />
          Capa Base
        </label>
        <select
          value={baseImagery}
          onChange={(e) => handleBaseImageryChange(e.target.value as keyof typeof BASE_IMAGERY_PROVIDERS)}
          className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-blue-500"
        >
          {Object.entries(BASE_IMAGERY_PROVIDERS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {/* Superposiciones */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Superposiciones
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800 rounded transition-colors">
            <input
              type="checkbox"
              checked={activeLayers.eumetsat}
              onChange={() => handleToggleLayer('eumetsat')}
              className="rounded"
            />
            <span className="text-xs text-gray-300">EUMETSAT (MSG)</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800 rounded transition-colors">
            <input
              type="checkbox"
              checked={activeLayers.ignPnoa}
              onChange={() => handleToggleLayer('ignPnoa')}
              className="rounded"
            />
            <span className="text-xs text-gray-300">IGN PNOA Ortofoto</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800 rounded transition-colors">
            <input
              type="checkbox"
              checked={activeLayers.igmeGeology}
              onChange={() => handleToggleLayer('igmeGeology')}
              className="rounded"
            />
            <span className="text-xs text-gray-300">IGME Geología</span>
          </label>
        </div>
      </div>

      {/* Terreno */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
          <Mountain className="w-3 h-3" />
          Terreno 3D
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-800 rounded transition-colors">
          <input
            type="checkbox"
            checked={activeLayers.terrain}
            onChange={() => handleToggleLayer('terrain')}
            className="rounded"
          />
          <div className="flex-1">
            <span className="text-xs text-gray-300">Activar Relieve</span>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Estado: <span className={terrainStatus === 'REAL' ? 'text-green-400' : 'text-amber-400'}>
                {terrainStatus === 'REAL' ? '✓ Real' : '⚠ Elipsoide'}
              </span>
            </div>
          </div>
        </label>
        {terrainStatus === 'ELLIPSOID' && activeLayers.terrain && (
          <div className="text-[10px] text-amber-400/70 bg-amber-950/20 border border-amber-800/40 rounded p-2">
            Se requiere token de Cesium ion para relieve real. Mostrando elipsoide.
          </div>
        )}
      </div>

      {/* Información de Cámara */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <label className="text-xs text-gray-400 font-medium">Posición de Cámara</label>
        <div className="bg-gray-800 rounded p-2 space-y-1 font-mono text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Lat:</span>
            <span className="text-white">{cameraInfo.lat.toFixed(5)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lon:</span>
            <span className="text-white">{cameraInfo.lon.toFixed(5)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Alt:</span>
            <span className="text-white">{(cameraInfo.height / 1000).toFixed(2)} km</span>
          </div>
        </div>
      </div>

      {/* Información del Territorio */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <label className="text-xs text-gray-400 font-medium">Territorio Piloto</label>
        <div className="bg-gray-800 rounded p-2 text-[10px]">
          <div className="text-white font-medium mb-1">{PILOT_AREA.name}</div>
          <div className="text-gray-400 text-[9px] italic">
            {PILOT_AREA.note}
          </div>
        </div>
      </div>
    </div>
  );
}
