import { missionData } from '../data/missionData';
import { AlertTriangle, MapPin, FileText, Shield } from 'lucide-react';

export default function AnomalyPanel() {
  const anomalies = missionData.anomalies;

  const evidenceColors = {
    TOPOGRAPHIC_OBS: { bg: 'bg-amber-900/30', border: 'border-amber-700/50', text: 'text-amber-300', label: 'Observación Topográfica' },
    HUMAN_ACTIVITY_HYPOTHESIS: { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300', label: 'Hipótesis Actividad Humana' },
    DOCUMENTARY_MINING_INDICIO: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300', label: 'Indicio Minero Documental' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          Anomalías Registradas
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300">
            {anomalies.length} anomalías
          </span>
          <span className="px-3 py-1 bg-red-900/30 rounded-lg text-sm text-red-300">
            0 confirmadas
          </span>
        </div>
      </div>

      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
          <AlertTriangle className="w-4 h-4" />
          Invariante de seguridad
        </div>
        <p className="text-xs text-amber-300/70">
          Ninguna anomalía puede marcarse como CONFIRMADA sin evidencia científica externa verificable.
          No se atribuyen anomalías a parcelas concretas hasta georreferenciación rigurosa del Cortijo de Daniela.
        </p>
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly) => {
          const evStyle = evidenceColors[anomaly.evidenceLevel];
          return (
            <div key={anomaly.id} className={`rounded-xl p-5 border ${evStyle.border} ${evStyle.bg}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{anomaly.id}</h3>
                  <span className={`text-xs font-medium ${evStyle.text}`}>
                    {evStyle.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Confianza</div>
                  <div className="text-2xl font-bold text-white">{(anomaly.confidence * 100).toFixed(0)}%</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        style={{ width: `${anomaly.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Dimensiones</div>
                  <div className="text-sm text-white font-mono">
                    {anomaly.dimensions.length}×{anomaly.dimensions.width}×{anomaly.dimensions.depth}m
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Elevación</div>
                  <div className="text-sm text-white font-mono">{anomaly.elevation}m</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Dist. al cauce</div>
                  <div className="text-sm text-white font-mono">{anomaly.distanceToChannel}m</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 uppercase">Registro IGME</div>
                  <div className={`text-sm font-mono ${
                    anomaly.igmeRecord === 'VERIFIED' ? 'text-green-400' :
                    anomaly.igmeRecord === 'NO_VERIFICADO' ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {anomaly.igmeRecord}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Metodología
                  </div>
                  <p className="text-xs text-gray-300">{anomaly.methodology}</p>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Archivo fuente</div>
                  <p className="text-xs text-gray-400 font-mono">{anomaly.sourceFile}</p>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Huella de fuente</div>
                  <p className="text-xs text-gray-500 font-mono">{anomaly.sourceFingerprint}</p>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Interpretaciones alternativas
                  </div>
                  <ul className="text-xs text-gray-400 space-y-0.5">
                    {anomaly.alternativeInterpretations.map((interp, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gray-600 mt-0.5">•</span>
                        {interp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  No confirmada — requiere revisión humana
                </span>
                <span className="text-xs text-gray-500">
                  {anomaly.geometry.type === 'Polygon' ? 'Polígono' : 'Punto'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
