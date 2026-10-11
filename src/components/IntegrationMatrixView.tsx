import { GitBranch, CheckCircle2, XCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

// Matriz de integración — solo funciones verificadas o marcadas como UNVERIFIED
const MATRIX = [
  {
    repo: 'pergolessi9-star/firecycle-ai',
    status: 'NOT_INSPECTED',
    functions: [
      { name: 'evidenceClassifier', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'reportGenerator', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'geojsonExporter', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'lasProcessor', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
    ],
  },
  {
    repo: 'sae-space-ai/GEOOBS-AI',
    status: 'NOT_INSPECTED',
    functions: [
      { name: 'geomorphologyEngine', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'layerManager', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'spatialQuery', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
      { name: 'humanReviewQueue', status: 'UNVERIFIED_IN_REPO' as const, notes: 'No inspeccionado en repositorio real' },
    ],
  },
  {
    repo: 'sae-space-ai/GODEYE',
    status: 'NOT_INSPECTED',
    functions: [],
  },
  {
    repo: 'sae-space-ai/atiende-ai',
    status: 'NOT_INSPECTED',
    functions: [],
  },
  {
    repo: 'sae-space-ai/minerales (este proyecto)',
    status: 'ACTIVE',
    functions: [
      { name: 'MissionProvider', status: 'IMPLEMENTED' as const, notes: 'Estado unificado con separación DEMO/REAL' },
      { name: 'lasReader', status: 'IMPLEMENTED' as const, notes: 'Lectura de cabecera LAS 1.4 en navegador' },
      { name: 'coordinates (UTM↔WGS84)', status: 'IMPLEMENTED' as const, notes: 'Transformación EPSG:25829/25830 ↔ EPSG:4326' },
      { name: 'igmeClient', status: 'IMPLEMENTED' as const, notes: 'Consulta IGME con fallback a proxy CORS' },
      { name: 'Procesamiento LAZ completo', status: 'BLOCKED' as const, notes: 'Requiere laz-perf en servidor' },
      { name: 'MDT real', status: 'BLOCKED' as const, notes: 'Requiere descarga de GeoTIFF oficial IGN' },
    ],
  },
];

export default function IntegrationMatrixView() {
  const statusIcons = {
    ACTIVE: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    IMPLEMENTED: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    PARTIAL: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    BLOCKED: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    UNVERIFIED_IN_REPO: <HelpCircle className="w-3.5 h-3.5 text-gray-400" />,
    PLANNED: <Clock className="w-3.5 h-3.5 text-blue-400" />,
    NOT_READY: <XCircle className="w-3.5 h-3.5 text-gray-500" />,
  };

  const statusColors = {
    ACTIVE: 'text-green-300',
    IMPLEMENTED: 'text-green-300',
    PARTIAL: 'text-amber-300',
    BLOCKED: 'text-red-300',
    UNVERIFIED_IN_REPO: 'text-gray-400',
    PLANNED: 'text-blue-300',
    NOT_READY: 'text-gray-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Matriz de Integración</h2>
      </div>

      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
          <AlertTriangle className="w-4 h-4" />
          Aviso de verificación
        </div>
        <p className="text-xs text-amber-300/70">
          Los repositorios externos (firecycle-ai, GEOOBS-AI, GODEYE, atiende-ai) no han sido
          inspeccionados directamente en esta sesión. Las funciones se listan como{' '}
          <code className="bg-gray-800 px-1 rounded">UNVERIFIED_IN_REPO</code> hasta que se
          comprueben en la estructura real del repositorio. No se inventan rutas ni funciones.
        </p>
      </div>

      {MATRIX.map((repo) => (
        <div key={repo.repo} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 px-5 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-mono text-sm text-blue-300">{repo.repo}</h3>
            <span className={`text-xs font-mono ${
              repo.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'
            }`}>
              {repo.status}
            </span>
          </div>

          <div className="p-5">
            {repo.functions.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Sin funciones listadas — repositorio no inspeccionado.
              </p>
            ) : (
              <div className="space-y-2">
                {repo.functions.map((fn) => (
                  <div key={fn.name} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-1">
                      {statusIcons[fn.status]}
                      <span className="text-sm text-white font-mono">{fn.name}</span>
                      <span className={`text-xs font-medium ${statusColors[fn.status]}`}>
                        {fn.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 ml-6">{fn.notes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Leyenda de estados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-gray-400">IMPLEMENTED — Código funcional</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-400">PARTIAL — Parcialmente funcional</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-gray-400">BLOCKED — Bloqueado externamente</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400">UNVERIFIED — No comprobado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
