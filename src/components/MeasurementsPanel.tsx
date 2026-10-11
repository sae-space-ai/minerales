import { useMeasurements, MeasurementTool } from '../lib/measurements';
import { Ruler, Mountain, Trash2, Download } from 'lucide-react';

export default function MeasurementsPanel() {
  const {
    activeTool,
    setActiveTool,
    measurements,
    currentPoints,
    terrainAvailable,
    setTerrainAvailable,
    finalizeMeasurement,
    deleteMeasurement,
    exportMeasurements
  } = useMeasurements();

  const tools: { id: MeasurementTool; label: string; icon: React.ReactNode; requiresTerrain: boolean }[] = [
    { id: 'DISTANCE_HORIZONTAL', label: 'Distancia Horizontal', icon: <Ruler className="w-4 h-4" />, requiresTerrain: false },
    { id: 'DISTANCE_GEODESIC', label: 'Distancia Geodésica', icon: <Ruler className="w-4 h-4" />, requiresTerrain: false },
    { id: 'DISTANCE_SURFACE', label: 'Distancia sobre Terreno', icon: <Mountain className="w-4 h-4" />, requiresTerrain: true },
    { id: 'ELEVATION_DIFF', label: 'Diferencia de Altura', icon: <Mountain className="w-4 h-4" />, requiresTerrain: true },
  ];

  const handleExport = () => {
    const geojson = exportMeasurements();
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `measurements_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Ruler className="w-5 h-5 text-orange-400" />
        <h2 className="text-xl font-bold text-white">Mediciones 3D</h2>
        <span className="ml-auto px-2 py-0.5 bg-orange-900/40 text-orange-300 rounded text-xs">
          Herramientas de medición
        </span>
      </div>

      {/* Estado del terreno */}
      <div className={`rounded-lg p-3 border ${
        terrainAvailable
          ? 'bg-green-950/20 border-green-800/40'
          : 'bg-amber-950/20 border-amber-800/40'
      }`}>
        <div className="flex items-center gap-2 text-sm">
          <span className={terrainAvailable ? 'text-green-400' : 'text-amber-400'}>
            {terrainAvailable ? '✓ Terreno real disponible' : '⚠ Sin terreno real (elipsoide)'}
          </span>
        </div>
        {!terrainAvailable && (
          <p className="text-xs text-amber-300/70 mt-1">
            Las mediciones altimétricas están bloqueadas. Se requiere un proveedor de terreno real.
          </p>
        )}
      </div>

      {/* Herramientas de medición */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Herramientas Disponibles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tools.map(tool => {
            const isBlocked = tool.requiresTerrain && !terrainAvailable;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                disabled={isBlocked}
                className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-orange-900/40 border border-orange-600/50 text-orange-200'
                    : isBlocked
                    ? 'bg-gray-800/30 border border-gray-700/30 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {tool.icon}
                <div className="flex-1">
                  <div className="text-sm font-medium">{tool.label}</div>
                  {isBlocked && (
                    <div className="text-xs text-amber-400/70">Requiere terreno real</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {activeTool && (
          <div className="mt-4 p-3 bg-orange-950/20 border border-orange-800/40 rounded-lg">
            <div className="text-xs text-orange-400 uppercase mb-1">Herramienta Activa</div>
            <div className="text-sm text-white">{tools.find(t => t.id === activeTool)?.label}</div>
            <div className="text-xs text-gray-400 mt-1">
              Puntos seleccionados: {currentPoints.length}
            </div>
            {currentPoints.length >= 2 && (
              <button
                onClick={() => finalizeMeasurement(activeTool)}
                className="mt-2 px-3 py-1.5 bg-orange-700/40 hover:bg-orange-700/60 border border-orange-600/50 rounded text-xs text-orange-200 transition-colors"
              >
                Finalizar Medición
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mediciones guardadas */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Mediciones Guardadas</h3>
          {measurements.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/50 rounded text-xs text-blue-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar GeoJSON
            </button>
          )}
        </div>

        {measurements.length === 0 ? (
          <p className="text-sm text-gray-500">No hay mediciones guardadas.</p>
        ) : (
          <div className="space-y-2">
            {measurements.map(measurement => (
              <div key={measurement.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {measurement.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {measurement.result.value !== null ? (
                        <>
                          <span className="text-white font-mono">
                            {measurement.result.value.toFixed(2)} {measurement.result.unit}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({measurement.result.precision})
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-400">
                          {measurement.result.limitation || 'Sin resultado'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {measurement.points.length} puntos · {measurement.terrainSource}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title="Eliminar medición"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
