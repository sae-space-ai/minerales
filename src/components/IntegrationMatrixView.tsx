import { integrationMatrix } from '../data/missionData';
import { GitBranch, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function IntegrationMatrixView() {
  const statusIcons = {
    ACTIVE: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    DEPRECATED: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    PLANNED: <Clock className="w-3.5 h-3.5 text-blue-400" />,
    IMPLEMENTED: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    PARTIAL: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    BLOCKED: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  };

  const statusColors = {
    ACTIVE: 'text-green-300',
    DEPRECATED: 'text-red-300',
    PLANNED: 'text-blue-300',
    IMPLEMENTED: 'text-green-300',
    PARTIAL: 'text-amber-300',
    BLOCKED: 'text-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Matriz de Integración</h2>
      </div>

      <p className="text-sm text-gray-400">
        Inventario declarativo de componentes e integraciones propuestas. Solo las rutas de frontend inspeccionadas aquí se han comprobado; los enlaces efectivos con FIRECYCLE y GEOOBS-AI siguen pendientes.
        Las etiquetas IMPLEMENTED, PARTIAL o BLOCKED indican alcance documentado, no pruebas de ejecución científica.
      </p>

      {integrationMatrix.map((repo) => (
        <div key={repo.repo} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 px-5 py-3 border-b border-gray-700">
            <h3 className="font-mono text-sm text-blue-300">{repo.repo}</h3>
          </div>

          <div className="p-5 space-y-4">
            {/* Existing Functions */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">
                Funciones existentes
              </h4>
              <div className="space-y-1">
                {repo.existingFunctions.map((fn) => (
                  <div key={fn.name} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                    {statusIcons[fn.status]}
                    <span className="text-sm text-white font-mono flex-1">{fn.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{fn.module}</span>
                    <span className={`text-xs font-medium ${statusColors[fn.status]}`}>
                      {fn.status}
                    </span>
                    {fn.usedInMission && (
                      <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 rounded text-[10px]">
                        MINERAL-01
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* New Functions */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">
                Funciones nuevas (MINERAL-01)
              </h4>
              <div className="space-y-2">
                {repo.newFunctions.map((fn) => (
                  <div key={fn.name} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-1">
                      {statusIcons[fn.status]}
                      <span className="text-sm text-white font-mono">{fn.name}</span>
                      <span className={`text-xs font-medium ${statusColors[fn.status]}`}>
                        {fn.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono ml-6">{fn.module}</div>
                    <div className="text-xs text-gray-400 ml-6 mt-1">
                      <span className="text-gray-500">Dependencia:</span> {fn.dependency}
                    </div>
                    <div className="text-xs text-gray-400 ml-6 mt-0.5">
                      <span className="text-gray-500">Nota:</span> {fn.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
