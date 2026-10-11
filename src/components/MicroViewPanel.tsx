import { useState } from 'react';
import { useMission } from '../lib/store';
import { createMicrocell, MicrocellSize, generateScientificCard } from '../lib/microcell';
import { MapPin, Maximize2, Grid3x3, Info } from 'lucide-react';

export default function MicroViewPanel() {
  const { state } = useMission();
  const [selectedSize, setSelectedSize] = useState<MicrocellSize>(1);
  const [centerLat, setCenterLat] = useState('38.01250');
  const [centerLon, setCenterLon] = useState('-6.06628');
  const [microcell, setMicrocell] = useState<any>(null);
  const [scientificCard, setScientificCard] = useState<any>(null);

  const handleCreateMicrocell = () => {
    const lat = parseFloat(centerLat);
    const lon = parseFloat(centerLon);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Coordenadas inválidas');
      return;
    }
    
    const cell = createMicrocell(lat, lon, selectedSize);
    setMicrocell(cell);
    
    // Generar ficha científica (sin datos LiDAR reales aún)
    const card = generateScientificCard(cell, null, 0);
    setScientificCard(card);
  };

  const sizes: { value: MicrocellSize; label: string }[] = [
    { value: 0.25, label: '0.25 m²' },
    { value: 1, label: '1 m²' },
    { value: 4, label: '4 m²' },
    { value: 25, label: '25 m²' },
    { value: 100, label: '100 m²' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Maximize2 className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">MICROVIEW 1M²</h2>
        <span className="ml-auto px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded text-xs">
          Microscopía geoespacial
        </span>
      </div>

      <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-lg p-4">
        <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold mb-2">
          <Info className="w-4 h-4" />
          Exploración a escala métrica
        </div>
        <p className="text-xs text-cyan-300/70">
          Seleccione un punto y un tamaño para crear una microcelda de investigación.
          El sistema calculará la geometría exacta en coordenadas UTM (metros) y mostrará
          la resolución real de cada fuente disponible.
        </p>
      </div>

      {/* Selector de coordenadas y tamaño */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Selección de microcelda
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Latitud (WGS84)</label>
            <input
              type="number"
              step="0.00001"
              value={centerLat}
              onChange={(e) => setCenterLat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Longitud (WGS84)</label>
            <input
              type="number"
              step="0.00001"
              value={centerLon}
              onChange={(e) => setCenterLon(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tamaño</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(parseFloat(e.target.value) as MicrocellSize)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
            >
              {sizes.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateMicrocell}
          className="w-full px-4 py-2 bg-cyan-700/40 hover:bg-cyan-700/60 border border-cyan-600/50 rounded-lg text-sm text-cyan-200 transition-colors flex items-center justify-center gap-2"
        >
          <Grid3x3 className="w-4 h-4" />
          Crear microcelda
        </button>
      </div>

      {/* Visualización de la microcelda */}
      {microcell && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="font-semibold text-white mb-4">Geometría de la microcelda</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">ID</div>
              <div className="text-xs text-white font-mono truncate">{microcell.id}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Área</div>
              <div className="text-sm text-white font-mono">{microcell.area.toFixed(4)} m²</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">Lado</div>
              <div className="text-sm text-white font-mono">{microcell.sideLength.toFixed(3)} m</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase">CRS</div>
              <div className="text-xs text-white font-mono">{microcell.crsOriginal}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Centro UTM</div>
              <div className="text-xs text-white font-mono">
                X: {microcell.centerUTM.x.toFixed(3)} m<br/>
                Y: {microcell.centerUTM.y.toFixed(3)} m
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Centro WGS84</div>
              <div className="text-xs text-white font-mono">
                Lat: {microcell.centerWGS84.lat.toFixed(6)}°<br/>
                Lon: {microcell.centerWGS84.lon.toFixed(6)}°
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 uppercase mb-2">Esquinas (WGS84)</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400 font-mono">
              {microcell.cornersWGS84.map((corner: any, i: number) => (
                <div key={i}>
                  <span className="text-gray-500">{['SW', 'SE', 'NE', 'NW'][i]}:</span>{' '}
                  {corner.lat.toFixed(6)}, {corner.lon.toFixed(6)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ficha científica */}
      {scientificCard && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="font-semibold text-white mb-4">Ficha científica</h3>
          
          <div className="space-y-3">
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3">
              <div className="text-xs text-amber-300/80">
                <strong>Estado:</strong> {scientificCard.reviewStatus.replace(/_/g, ' ')}
              </div>
              {scientificCard.limitations.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-amber-400 uppercase mb-1">Limitaciones</div>
                  <ul className="text-xs text-amber-300/70 space-y-1">
                    {scientificCard.limitations.map((lim: string, i: number) => (
                      <li key={i}>• {lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Estadísticas LiDAR</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Retornos totales: <span className="text-white font-mono">{scientificCard.lidarStats.totalReturns ?? 'null'}</span></div>
                  <div>Retornos suelo: <span className="text-white font-mono">{scientificCard.lidarStats.groundReturns ?? 'null'}</span></div>
                  <div>Densidad: <span className="text-white font-mono">{scientificCard.lidarStats.densityPerM2?.toFixed(2) ?? 'null'} pt/m²</span></div>
                  <div>Cota mín: <span className="text-white font-mono">{scientificCard.lidarStats.minZ?.toFixed(2) ?? 'null'} m</span></div>
                  <div>Cota máx: <span className="text-white font-mono">{scientificCard.lidarStats.maxZ?.toFixed(2) ?? 'null'} m</span></div>
                  <div>Desnivel: <span className="text-white font-mono">{scientificCard.lidarStats.elevationRange?.toFixed(2) ?? 'null'} m</span></div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Fuentes disponibles</div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Ortofoto: <span className="text-amber-400">No verificada</span></div>
                  <div>Satélite: <span className="text-amber-400">No verificada</span></div>
                  <div>LiDAR: <span className={scientificCard.sources.lidar ? 'text-green-400' : 'text-gray-500'}>{scientificCard.sources.lidar ? 'Disponible' : 'No cargado'}</span></div>
                  <div>MDT: <span className="text-amber-400">No verificado</span></div>
                  <div>Geología: <span className="text-amber-400">No verificado</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!microcell && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center">
          <Grid3x3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Sin microcelda seleccionada</h3>
          <p className="text-sm text-gray-500">
            Introduzca coordenadas y seleccione un tamaño para crear una microcelda de investigación.
          </p>
        </div>
      )}
    </div>
  );
}
