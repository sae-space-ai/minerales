import { missionData } from '../data/missionData';
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
} from 'lucide-react';

export default function Dashboard() {
  const mission = missionData;

  const statusColors = {
    HEADER_ONLY: 'text-amber-400',
    PROCESSED: 'text-green-400',
    BLOCKED_RUNTIME: 'text-red-400',
    PENDING: 'text-gray-400',
    IN_PROGRESS: 'text-blue-400',
    COMPLETED: 'text-green-400',
    SUCCESS: 'text-green-400',
    QUERY_FAILED: 'text-red-400',
    NOT_QUERIED: 'text-gray-400',
  };

  const statusIcons = {
    HEADER_ONLY: <Clock className="w-4 h-4" />,
    BLOCKED_RUNTIME: <XCircle className="w-4 h-4" />,
    QUERY_FAILED: <AlertTriangle className="w-4 h-4" />,
    NOT_QUERIED: <HelpCircle className="w-4 h-4" />,
    SUCCESS: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">⛏️</span>
              {mission.name}
            </h1>
            <p className="text-gray-400 mt-1">
              Entorno del Cortijo de Daniela, Arroyo de Matarrama, TM Montemolín (Badajoz)
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Etapas previstas (sin ejecución acreditada):</span>
              {mission.lineage.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded text-xs font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-mono ${statusColors[mission.processingStatus]}`}>
              {mission.processingStatus}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Fecha de corte documental: 11/10/2026 (sin sincronización automática)
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LAZ Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Archivo LAZ</h3>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${statusColors[mission.lasStatus.status]}`}>
            {statusIcons[mission.lasStatus.status as keyof typeof statusIcons]}
            <span className="font-mono text-sm">{mission.lasStatus.status}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-gray-500">Archivo:</span> {mission.lasStatus.filename}</p>
            <p><span className="text-gray-500">Puntos declarados en cabecera:</span> {mission.lasStatus.pointCount.toLocaleString('es-ES')}</p>
            <p><span className="text-gray-500">Tamaño:</span> {(mission.lasStatus.fileSize / 1024 / 1024).toFixed(1)} MB</p>
            <p><span className="text-gray-500">CRS:</span> {mission.lasStatus.crs}</p>
            <p><span className="text-gray-500">Versión:</span> LAS {mission.lasStatus.version}</p>
            <p><span className="text-gray-500">Cotas Z:</span> {mission.lasStatus.minZ.toFixed(2)} — {mission.lasStatus.maxZ.toFixed(2)} m</p>
            <p><span className="text-gray-500">SHA-256:</span> <code className="text-[10px] break-all">{mission.lasStatus.checksumSHA256.slice(0, 24)}...</code></p>
          </div>
        </div>

        {/* IGME Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Consulta IGME</h3>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${statusColors[mission.igmeStatus.status]}`}>
            {statusIcons[mission.igmeStatus.status as keyof typeof statusIcons]}
            <span className="font-mono text-sm">{mission.igmeStatus.status}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-gray-500">Endpoint:</span></p>
            <p className="text-[10px] break-all text-gray-500 font-mono">{mission.igmeStatus.endpoint}</p>
            <p className="mt-2"><span className="text-gray-500">Estado:</span></p>
            <p className="text-amber-400/80 italic">{mission.igmeStatus.errorMessage}</p>
            <p className="mt-1"><span className="text-gray-500">Indicios:</span> <span className="text-amber-300 font-bold">NO CONSULTADOS — recuento desconocido</span></p>
          </div>
        </div>

        {/* Processing Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Procesamiento</h3>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${statusColors[mission.processingStatus]}`}>
            <XCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{mission.processingStatus}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-400">
            <p className="text-red-400/80">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Clasificación de retornos Ground no ejecutada sobre este LAZ.
            </p>
            <p>Sin MDT real procesado. Sin hillshade ni pendientes calculadas para esta zona.</p>
            <p className="mt-2 text-gray-500">
              Requiere: librería LAZ en servidor (laz-perf / laszip) o microservicio aislado.
              No se exigen estadísticas inventadas.
            </p>
            <p className="mt-1 text-gray-500">
              Alternativa: raster COG MDT 50 cm del IGN si hay cobertura compatible.
            </p>
          </div>
        </div>
      </div>

      {/* Geomorphological Evaluation */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Evaluación Geomorfológica</h3>
          <span className="ml-auto px-2 py-0.5 bg-amber-900/40 text-amber-300 rounded text-xs">
            {mission.geomorphologicalEvaluation.conclusion.replace(/_/g, ' ')}
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
            const pattern = mission.geomorphologicalEvaluation[key as keyof typeof mission.geomorphologicalEvaluation] as any;
            return (
              <div key={key} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{icon} {label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    pattern.confidence === 'HIGH' ? 'bg-green-900/40 text-green-300' :
                    pattern.confidence === 'MEDIUM' ? 'bg-amber-900/40 text-amber-300' :
                    'bg-gray-700/40 text-gray-400'
                  }`}>
                    {pattern.confidence}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{pattern.description}</p>
                <p className="text-xs text-amber-400/70 mt-1 italic">⚠️ {pattern.caveat}</p>
                <p className="text-xs text-gray-500 mt-1">Resultado: {pattern.detected === null ? 'NO EVALUADO' : pattern.detected}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <span className="text-gray-400">Umbrales metodológicos propuestos; NO ejecutados:</span> profundidad mín. {mission.geomorphologicalEvaluation.thresholds.minDepth}m |
          pendiente mín. {mission.geomorphologicalEvaluation.thresholds.minSlope}° |
          área mín. {mission.geomorphologicalEvaluation.thresholds.minArea}m²
        </div>
      </div>
    </div>
  );
}
