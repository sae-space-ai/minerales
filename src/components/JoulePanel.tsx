import { useState, useEffect } from 'react';
import { jouleGovernor } from '../lib/joule';
import { Activity, Cpu, HardDrive, Zap, AlertCircle } from 'lucide-react';

export default function JoulePanel() {
  const [telemetry, setTelemetry] = useState(jouleGovernor.getTelemetry());
  const [mode, setMode] = useState(jouleGovernor.getMode());

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(jouleGovernor.getTelemetry());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (newMode: 'OFF' | 'SHADOW' | 'CANARY' | 'ACTIVE') => {
    jouleGovernor.setMode(newMode);
    setMode(newMode);
  };

  const handleClearCache = () => {
    jouleGovernor.clearCache();
    setTelemetry(jouleGovernor.getTelemetry());
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
    return `${(ms / 60000).toFixed(2)} min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">JOULE — Optimización</h2>
        <span className="ml-auto px-2 py-0.5 bg-yellow-900/40 text-yellow-300 rounded text-xs">
          Gobernador de recursos
        </span>
      </div>

      {/* Selector de modo */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Modo de Operación</h3>
        <div className="grid grid-cols-4 gap-2">
          {(['OFF', 'SHADOW', 'CANARY', 'ACTIVE'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-yellow-700/40 border border-yellow-600/50 text-yellow-200'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          {mode === 'OFF' && 'JOULE desactivado. Aplicación usa ruta de referencia sin optimización.'}
          {mode === 'SHADOW' && 'JOULE calcula recomendaciones pero no cambia la ruta de producción.'}
          {mode === 'CANARY' && 'JOULE optimiza fracción controlada de tareas autorizadas.'}
          {mode === 'ACTIVE' && 'JOULE selecciona automáticamente rutas con controles de calidad.'}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cache */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Cache</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Tamaño:</span>
              <span className="text-white font-mono">{formatBytes(telemetry.cache.totalBytes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Entradas:</span>
              <span className="text-white font-mono">{telemetry.cache.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hits:</span>
              <span className="text-green-400 font-mono">{telemetry.cache.hits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Misses:</span>
              <span className="text-red-400 font-mono">{telemetry.cache.misses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hit Rate:</span>
              <span className="text-white font-mono">
                {telemetry.cache.hitRate !== null 
                  ? `${(telemetry.cache.hitRate * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-green-400" />
            <h3 className="font-semibold text-white text-sm">Tareas</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Activas:</span>
              <span className="text-white font-mono">{telemetry.scheduler.running}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">En cola:</span>
              <span className="text-white font-mono">{telemetry.scheduler.queued}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completadas:</span>
              <span className="text-white font-mono">{telemetry.scheduler.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Canceladas:</span>
              <span className="text-amber-400 font-mono">{telemetry.scheduler.cancelled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Errores:</span>
              <span className="text-red-400 font-mono">{telemetry.scheduler.failed}</span>
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Recursos</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Memoria:</span>
              <span className="text-white font-mono">
                {telemetry.budget.measuredMemoryBytes !== null
                  ? formatBytes(telemetry.budget.measuredMemoryBytes)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Origen:</span>
              <span className={`font-mono ${
                telemetry.budget.memoryOrigin === 'MEASURED' ? 'text-green-400' :
                telemetry.budget.memoryOrigin === 'ESTIMATED' ? 'text-amber-400' :
                'text-gray-500'
              }`}>
                {telemetry.budget.memoryOrigin}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CPU:</span>
              <span className="text-white font-mono">
                {telemetry.budget.measuredCpuPercent !== null
                  ? `${telemetry.budget.measuredCpuPercent.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GPU:</span>
              <span className="text-white font-mono">
                {telemetry.budget.measuredGpuPercent !== null
                  ? `${telemetry.budget.measuredGpuPercent.toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Eficiencia */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Eficiencia</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-gray-400 mb-1">Peticiones evitadas</div>
            <div className="text-white font-mono text-lg">{telemetry.efficiency.avoidedRequests}</div>
            <div className="text-gray-500 text-[10px]">{telemetry.efficiency.avoidedRequestsOrigin}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Trabajo reutilizado</div>
            <div className="text-white font-mono text-lg">{telemetry.telemetry.reusedWork}</div>
            <div className="text-gray-500 text-[10px]">MEASURED</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Tiempo ejecutado</div>
            <div className="text-white font-mono text-lg">{formatTime(telemetry.efficiency.totalExecutedMs)}</div>
            <div className="text-gray-500 text-[10px]">{telemetry.efficiency.efficiencyOrigin}</div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Tiempo estimado</div>
            <div className="text-white font-mono text-lg">{formatTime(telemetry.efficiency.totalEstimatedMs)}</div>
            <div className="text-gray-500 text-[10px]">ESTIMATED</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Controles</h3>
        <div className="flex gap-2">
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded-lg text-sm text-red-300 transition-colors flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Limpiar Cache
          </button>
        </div>
      </div>
    </div>
  );
}
