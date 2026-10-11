import { useMission } from '../lib/store';
import {
  AlertTriangle,
  Database,
  FileWarning,
  MapPin,
  Shield,
  Clock,
  Server,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { useRef } from 'react';

export default function Dashboard() {
  const { state, loadLASFile, queryIGME, setMode } = useMission();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLASFile(file);
    }
  };

  const statusColors: Record<string, string> = {
    NOT_STARTED: 'text-gray-400',
    HEADER_ONLY: 'text-amber-400',
    IN_PROGRESS: 'text-blue-400',
    COMPLETED: 'text-green-400',
    BLOCKED_RUNTIME: 'text-red-400',
    BLOCKED_EXTERNAL: 'text-red-400',
    FAILED: 'text-red-400',
    NOT_QUERIED: 'text-gray-400',
    QUERY_SUCCESS: 'text-green-400',
    QUERY_EMPTY: 'text-amber-400',
    QUERY_FAILED: 'text-red-400',
    QUERY_PARTIAL: 'text-amber-400',
    QUERY_UNSUPPORTED: 'text-gray-400',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    NOT_STARTED: <HelpCircle className="w-4 h-4" />,
    HEADER_ONLY: <Clock className="w-4 h-4" />,
    BLOCKED_RUNTIME: <XCircle className="w-4 h-4" />,
    BLOCKED_EXTERNAL: <XCircle className="w-4 h-4" />,
    QUERY_FAILED: <AlertTriangle className="w-4 h-4" />,
    NOT_QUERIED: <HelpCircle className="w-4 h-4" />,
    QUERY_SUCCESS: <CheckCircle2 className="w-4 h-4" />,
    QUERY_EMPTY: <AlertTriangle className="w-4 h-4" />,
    FAILED: <XCircle className="w-4 h-4" />,
    IN_PROGRESS: <Clock className="w-4 h-4" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4" />,
    QUERY_PARTIAL: <AlertTriangle className="w-4 h-4" />,
    QUERY_UNSUPPORTED: <HelpCircle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">⛏️</span>
              {state.name}
            </h1>
            <p className="text-gray-400 mt-1">
              Entorno del Cortijo de Daniela, Arroyo de Matarrama, TM Montemolín (Badajoz)
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Linaje:</span>
              {state.lineage.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded text-xs font-mono">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Modo:</span>
              <button
                onClick={() => setMode(state.mode === 'DEMO' ? 'REAL' : 'DEMO')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  state.mode === 'REAL'
                    ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                    : 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                }`}
              >
                {state.mode === 'REAL' ? '🔬 REAL' : '🎭 DEMO'}
              </button>
              {state.mode === 'DEMO' && (
                <span className="text-xs text-amber-400/70">
                  Los datos mostrados son sintéticos. Cambie a REAL para datos verificados.
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-mono ${statusColors[state.lasFile.status]}`}>
              {state.lasFile.status}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(state.updatedAt).toLocaleString('es-ES')}
            </div>
          </div>
        </div>
      </div>

      {/* Location Warning */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            <strong>{state.cortijoLocation.status}:</strong> {state.cortijoLocation.note}
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-400/70 text-xs mt-1 ml-5">
          <span>Referencia arroyo:</span>
          <span className="font-mono">
            {state.arroyoReference.coordinates[0].toFixed(5)}, {state.arroyoReference.coordinates[1].toFixed(5)}
          </span>
          <span>({state.arroyoReference.status})</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LAZ Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Archivo LAZ/LAS</h3>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${statusColors[state.lasFile.status]}`}>
            {statusIcons[state.lasFile.status]}
            <span className="font-mono text-sm">{state.lasFile.status}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            {state.lasFile.filename ? (
              <>
                <p><span className="text-gray-500">Archivo:</span> {state.lasFile.filename}</p>
                <p><span className="text-gray-500">Tamaño:</span> {state.lasFile.fileSize ? (state.lasFile.fileSize / 1024 / 1024).toFixed(1) : '?'} MB</p>
                <p><span className="text-gray-500">Puntos:</span> {state.lasFile.pointCount?.toLocaleString() ?? 'null'}</p>
                <p><span className="text-gray-500">CRS:</span> {state.lasFile.crsOriginal ?? 'desconocido'}</p>
                <p><span className="text-gray-500">Versión:</span> LAS {state.lasFile.lasVersion ?? '?'}</p>
                <p><span className="text-gray-500">Formato:</span> {state.lasFile.pointFormat ?? '?'}</p>
                <p><span className="text-gray-500">Cotas Z:</span> {state.lasFile.bounds.zMin?.toFixed(2) ?? '?'} — {state.lasFile.bounds.zMax?.toFixed(2) ?? '?'} m</p>
                <p><span className="text-gray-500">Densidad:</span> {state.lasFile.pointDensity?.toFixed(2) ?? '?'} pt/m²</p>
                {state.lasFile.checksumSHA256 && (
                  <p><span className="text-gray-500">SHA-256:</span> <code className="text-[10px] break-all">{state.lasFile.checksumSHA256.slice(0, 24)}...</code></p>
                )}
                <p><span className="text-gray-500">Clasificación:</span> <span className="text-blue-300">{state.lasFile.dataClassification}</span></p>
                {state.lasFile.errorMessage && (
                  <p className="text-red-400/80 mt-1">⚠️ {state.lasFile.errorMessage}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-500">Ningún archivo cargado.</p>
                <p className="text-gray-500">Archivo real esperado:</p>
                <p className="font-mono text-[10px] text-gray-400">PNOA_2024_AND_757-4211_H29_NPC01.laz</p>
                <p className="text-gray-500">CRS original: EPSG:25829</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".las,.laz"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700/50 rounded-lg text-sm text-blue-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Cargar archivo LAS/LAZ
          </button>
        </div>

        {/* IGME Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Consulta IGME</h3>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${statusColors[state.igme.status]}`}>
            {statusIcons[state.igme.status]}
            <span className="font-mono text-sm">{state.igme.status}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-gray-500">Endpoint:</span></p>
            <p className="text-[10px] break-all text-gray-500 font-mono">{state.igme.endpoint}</p>
            {state.igme.lastQueryTimestamp && (
              <p><span className="text-gray-500">Última consulta:</span> {new Date(state.igme.lastQueryTimestamp).toLocaleString('es-ES')}</p>
            )}
            {state.igme.totalFeatures !== null && (
              <p><span className="text-gray-500">Indicios:</span> <span className="text-white font-bold">{state.igme.totalFeatures}</span></p>
            )}
            {state.igme.totalFeatures === null && state.igme.status !== 'NOT_QUERIED' && (
              <p><span className="text-gray-500">Indicios:</span> <span className="text-red-400">null (consulta fallida)</span></p>
            )}
            {state.igme.errorMessage && (
              <p className="text-amber-400/80 italic mt-1">{state.igme.errorMessage}</p>
            )}
            <p><span className="text-gray-500">Clasificación:</span> <span className="text-blue-300">{state.igme.dataClassification}</span></p>
          </div>
          <button
            onClick={queryIGME}
            className="mt-3 w-full px-3 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 rounded-lg text-sm text-purple-300 transition-colors"
          >
            Consultar IGME
          </button>
        </div>

        {/* Processing Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Procesamiento</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              {state.lasFile.headerRead ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span>Lectura de cabecera</span>
            </div>
            <div className="flex items-center gap-2">
              {state.lasFile.pointsDecompressed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span>Descompresión LAZ</span>
              {!state.lasFile.pointsDecompressed && (
                <span className="text-red-400/70">(requiere servidor)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {state.lasFile.groundClassified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span>Clasificación Ground</span>
              {!state.lasFile.groundClassified && (
                <span className="text-red-400/70">(pendiente)</span>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-gray-500">
                Sin descompresión LAZ no se puede generar MDT real, hillshade ni pendiente.
              </p>
              <p className="text-gray-500 mt-1">
                Alternativa: importar MDT GeoTIFF oficial del IGN-CNIG.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Geomorphological Evaluation */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Evaluación Geomorfológica</h3>
          <span className="ml-auto px-2 py-0.5 bg-amber-900/40 text-amber-300 rounded text-xs">
            {state.geomorphological.conclusion.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
            <FileWarning className="w-4 h-4" />
            REVISIÓN HUMANA REQUERIDA
          </div>
          <p className="text-xs text-red-300/70 mt-1">
            El origen minero nunca se deduce exclusivamente de morfología.
            Los resultados se presentan en tres niveles separados:
            observación topográfica → hipótesis de actividad humana → indicio minero documental.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'depressions', label: 'Depresiones', icon: '🕳️' },
            { key: 'trenches', label: 'Zanjas/Trincheras', icon: '📏' },
            { key: 'spoilHeaps', label: 'Escombreras', icon: '🪨' },
            { key: 'cuts', label: 'Cortes', icon: '⛰️' },
          ].map(({ key, label, icon }) => {
            const pattern = state.geomorphological[key as keyof typeof state.geomorphological] as { count: number | null; status: string };
            return (
              <div key={key} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{icon} {label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    pattern.status === 'COMPUTED' ? 'bg-green-900/40 text-green-300' :
                    pattern.status === 'BLOCKED' ? 'bg-red-900/40 text-red-300' :
                    'bg-gray-700/40 text-gray-400'
                  }`}>
                    {pattern.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Detectados: <span className="font-mono text-white">{pattern.count === null ? 'null' : pattern.count}</span>
                </p>
                {pattern.status === 'NOT_COMPUTED' && (
                  <p className="text-xs text-amber-400/70 mt-1 italic">
                    ⚠️ No calculado — requiere MDT real procesado.
                  </p>
                )}
                {pattern.status === 'BLOCKED' && (
                  <p className="text-xs text-red-400/70 mt-1 italic">
                    ⚠️ Bloqueado — sin datos de suficiente resolución.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <span className="text-gray-400">Umbrales configurados:</span> profundidad mín. {state.geomorphological.thresholds.minDepth}m |
          pendiente mín. {state.geomorphological.thresholds.minSlope}° |
          área mín. {state.geomorphological.thresholds.minArea}m²
        </div>
      </div>
    </div>
  );
}
