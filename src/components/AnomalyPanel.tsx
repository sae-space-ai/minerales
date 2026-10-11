import { useMission } from '../lib/store';
import { AlertTriangle, MapPin, FileText, Shield } from 'lucide-react';

export default function AnomalyPanel() {
  const { state } = useMission();
  const anomalies = state.anomalies;
  const isDemo = state.mode === 'DEMO';

  const classificationColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    GEOMETRIC_CANDIDATE: { bg: 'bg-amber-900/30', border: 'border-amber-700/50', text: 'text-amber-300', label: 'Candidato Geométrico' },
    POSSIBLE_ANTHROPIC_FEATURE: { bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-300', label: 'Posible Rasgo Antrópico' },
    DOCUMENTARY_MINING_RECORD: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300', label: 'Registro Minero Documental' },
    SPATIALLY_CORRELATED_CANDIDATE: { bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-300', label: 'Candidato Correlacionado Espacialmente' },
    HUMAN_REVIEWED: { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-300', label: 'Revisado por Humano' },
    MINING_CONFIRMED_WITH_DOCUMENTED_EVIDENCE: { bg: 'bg-emerald-900/30', border: 'border-emerald-700/50', text: 'text-emerald-300', label: 'Minería Confirmada con Evidencia Documental' },
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
            {anomalies.filter(a => a.confirmed).length} confirmadas
          </span>
          {isDemo && (
            <span className="px-3 py-1 bg-amber-900/30 rounded-lg text-sm text-amber-300">
              MODO DEMO
            </span>
          )}
        </div>
      </div>

      {isDemo && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
            <AlertTriangle className="w-4 h-4" />
            Modo DEMO — Datos sintéticos
          </div>
          <p className="text-xs text-amber-300/70">
            Las anomalías mostradas son datos de demostración. No corresponden a observaciones reales.
            Cambie a modo REAL y cargue un archivo LAZ/LAS para ver anomalías calculadas.
          </p>
        </div>
      )}

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

      {anomalies.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Sin anomalías</h3>
          <p className="text-sm text-gray-500">
            {state.mode === 'REAL'
              ? 'No hay anomalías calculadas. Cargue un archivo LAZ/LAS o MDT para procesar datos reales.'
              : 'No hay anomalías. Cambie a modo DEMO para ver datos de demostración.'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Anomalías calculadas: <span className="font-mono">null</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => {
            const style = classificationColors[anomaly.classification] || classificationColors.GEOMETRIC_CANDIDATE;
            const isDemoAnomaly = anomaly.dataClassification === 'DEMO_SYNTHETIC';
            return (
              <div key={anomaly.id} className={`rounded-xl p-5 border ${style.border} ${style.bg} ${isDemoAnomaly ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{anomaly.id}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${style.text}`}>
                        {style.label}
                      </span>
                      {isDemoAnomaly && (
                        <span className="px-2 py-0.5 bg-amber-900/50 text-amber-300 rounded text-[10px]">
                          DEMO SYNTHETIC
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Confianza</div>
                    <div className="text-2xl font-bold text-white">
                      {anomaly.confidence !== null ? `${(anomaly.confidence * 100).toFixed(0)}%` : 'null'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 uppercase">Dimensiones</div>
                    <div className="text-sm text-white font-mono">
                      {anomaly.dimensions.length !== null
                        ? `${anomaly.dimensions.length}×${anomaly.dimensions.width}×${anomaly.dimensions.depth}m`
                        : 'null'}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 uppercase">Elevación</div>
                    <div className="text-sm text-white font-mono">
                      {anomaly.elevation !== null ? `${anomaly.elevation}m` : 'null'}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-500 uppercase">Dist. al cauce</div>
                    <div className="text-sm text-white font-mono">
                      {anomaly.distanceToChannel !== null ? `${anomaly.distanceToChannel}m` : 'null'}
                    </div>
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
                  {anomaly.methodology && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Metodología
                      </div>
                      <p className="text-xs text-gray-300">{anomaly.methodology}</p>
                    </div>
                  )}
                  {anomaly.sourceFile && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Archivo fuente</div>
                      <p className="text-xs text-gray-400 font-mono">{anomaly.sourceFile}</p>
                    </div>
                  )}
                  {anomaly.sourceFingerprint && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Huella de fuente</div>
                      <p className="text-xs text-gray-500 font-mono">{anomaly.sourceFingerprint}</p>
                    </div>
                  )}
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

                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      Clasificación datos: <span className="text-blue-300">{anomaly.dataClassification}</span>
                    </span>
                    <span className="text-gray-500">
                      Revisión humana: <span className={anomaly.humanReviewed ? 'text-green-400' : 'text-amber-400'}>
                        {anomaly.humanReviewed ? 'Sí' : 'Pendiente'}
                      </span>
                    </span>
                  </div>
                  {!anomaly.confirmed && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      No confirmada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
