import { useMission } from '../lib/store';
import { useSatelliteTimeline, parseTimeDimension, TemporalInstant } from '../lib/timeline';
import { useEffect } from 'react';
import { Clock, Play, Pause, SkipBack, SkipForward, GitCompare } from 'lucide-react';

export default function TimelinePanel() {
  const { state } = useMission();
  const timeline = useSatelliteTimeline();

  // Registrar capas temporales conocidas
  useEffect(() => {
    // EUMETSAT MSG - dimensión temporal verificada
    const eumetsatInstants = parseTimeDimension(
      '2020-09-01T00:00:00Z/2026-10-11T05:45:00Z/PT15M',
      'EUMETSAT EUMETView',
      'eumetsat-msg',
      50 // Limitar a 50 instantes para rendimiento
    );

    timeline.registerLayer({
      id: 'eumetsat-msg',
      name: 'MSG - Meteosat Second Generation',
      source: 'EUMETSAT EUMETView',
      timeDimension: true,
      instants: eumetsatInstants,
      timeRange: {
        start: '2020-09-01',
        end: '2026-10-11',
        interval: 'PT15M'
      }
    });
  }, []);

  const currentLayer = timeline.getCurrentLayerInfo();
  const availableInstants = timeline.getAvailableInstants();

  const formatDateTime = (instant: TemporalInstant) => {
    return `${instant.date} ${instant.time}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Timeline Satelital</h2>
        <span className="ml-auto px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded text-xs">
          Observación temporal
        </span>
      </div>

      {/* Selector de capa temporal */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Capas Temporales Disponibles</h3>
        
        {timeline.layers.length === 0 ? (
          <p className="text-sm text-gray-500">No hay capas temporales registradas.</p>
        ) : (
          <div className="space-y-2">
            {timeline.layers.map(layer => (
              <div
                key={layer.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  timeline.state.activeLayerId === layer.id
                    ? 'bg-indigo-900/30 border-indigo-600/50'
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                }`}
                onClick={() => timeline.selectLayer(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{layer.name}</div>
                    <div className="text-xs text-gray-400">{layer.source}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {layer.instants.length} instantes
                  </div>
                </div>
                {layer.timeRange.start && layer.timeRange.end && (
                  <div className="text-xs text-gray-500 mt-1">
                    {layer.timeRange.start} → {layer.timeRange.end}
                    {layer.timeRange.interval && ` (cada ${layer.timeRange.interval})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controles de reproducción */}
      {currentLayer && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="font-semibold text-white mb-3">Controles Temporales</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => timeline.selectPreviousInstant()}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              title="Instante anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                if (timeline.state.playback.playing) {
                  timeline.stopPlayback();
                } else {
                  timeline.startPlayback(1);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                timeline.state.playback.playing
                  ? 'bg-red-700/40 hover:bg-red-700/60 text-red-200'
                  : 'bg-green-700/40 hover:bg-green-700/60 text-green-200'
              }`}
              title={timeline.state.playback.playing ? 'Detener' : 'Reproducir'}
            >
              {timeline.state.playback.playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={() => timeline.selectNextInstant()}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              title="Instante siguiente"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => timeline.setComparisonMode(!timeline.state.comparisonMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  timeline.state.comparisonMode
                    ? 'bg-purple-700/40 text-purple-200 border border-purple-600/50'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                Comparar A/B
              </button>
            </div>
          </div>

          {/* Instante seleccionado */}
          {timeline.state.selectedInstant && (
            <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-lg p-3 mb-3">
              <div className="text-xs text-indigo-400 uppercase mb-1">Instante Seleccionado</div>
              <div className="text-sm text-white font-mono">
                {formatDateTime(timeline.state.selectedInstant)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Fuente: {timeline.state.selectedInstant.source}
              </div>
            </div>
          )}

          {/* Selector de instantes */}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {availableInstants.slice(0, 20).map((instant, idx) => (
              <div
                key={instant.timestamp}
                onClick={() => timeline.selectInstant(instant)}
                className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                  timeline.state.selectedInstant?.timestamp === instant.timestamp
                    ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-600/50'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {formatDateTime(instant)}
              </div>
            ))}
            {availableInstants.length > 20 && (
              <div className="text-xs text-gray-500 text-center py-2">
                ... y {availableInstants.length - 20} instantes más
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparación temporal */}
      {timeline.state.comparisonMode && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="font-semibold text-white mb-3">Comparación Temporal A/B</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-purple-400 uppercase mb-1">Instante A</div>
              {timeline.state.comparisonInstantA ? (
                <div className="text-sm text-white font-mono">
                  {formatDateTime(timeline.state.comparisonInstantA)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Seleccionar instante A</div>
              )}
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-purple-400 uppercase mb-1">Instante B</div>
              {timeline.state.comparisonInstantB ? (
                <div className="text-sm text-white font-mono">
                  {formatDateTime(timeline.state.comparisonInstantB)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Seleccionar instante B</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!currentLayer && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Sin capa temporal seleccionada</h3>
          <p className="text-sm text-gray-500">
            Seleccione una capa temporal para explorar observaciones en diferentes instantes.
          </p>
        </div>
      )}
    </div>
  );
}
