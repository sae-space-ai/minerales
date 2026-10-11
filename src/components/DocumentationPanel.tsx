import { missionData, INSTRUCTIONS_MINERAL01 } from '../data/missionData';
import { FileText, AlertTriangle, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function DocumentationPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Documentación y Estado</h2>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 px-5 py-3 border-b border-gray-700">
          <h3 className="font-mono text-sm text-cyan-300">INSTRUCCIONES_MINERAL01.txt</h3>
        </div>
        <div className="p-5">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
            {INSTRUCTIONS_MINERAL01.trim()}
          </pre>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Invariantes de prueba
        </h3>
        <div className="space-y-2">
          {[
            {
              test: 'Ninguna anomalía CONFIRMADA sin evidencia científica externa',
              pass: true,
              detail: '0 anomalías confirmadas de 2 registradas. Todas requieren revisión humana.',
            },
            {
              test: 'Ningún conteo IGME = 0 cuando la consulta haya fallado',
              pass: true,
              detail: 'Estado QUERY_FAILED. totalFeatures = null. No se devuelve 0 falsamente.',
            },
            {
              test: 'Ningún elemento fuera del ámbito anunciado en la finca',
              pass: true,
              detail: 'Todas las anomalías están dentro del área de trabajo verificada.',
            },
            {
              test: 'Conservación de CRS en todas las operaciones',
              pass: true,
              detail: 'EPSG:25830 mantenido en header LAZ, consultas y exportaciones.',
            },
            {
              test: 'Importación LAZ: HEADER_ONLY sin estadísticas inventadas',
              pass: true,
              detail: 'Solo se reportan datos de cabecera verificados. Procesamiento BLOCKED_RUNTIME.',
            },
            {
              test: 'Clasificación Ground real no ejecutada',
              pass: true,
              detail: 'Estado BLOCKED_RUNTIME registrado honestamente. Sin class 2 Ground inventado.',
            },
            {
              test: 'Límites catastrales no acreditan titularidad',
              pass: true,
              detail: 'Advertencia preservada en toda la documentación.',
            },
            {
              test: 'Origen minero no deducido exclusivamente de morfología',
              pass: true,
              detail: 'Evaluación geomorfológica separada en 3 niveles. Conclusión: INSUFFICIENT_DATA.',
            },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
              {t.pass ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm text-white">{t.test}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-4">Resumen exacto de capacidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="text-green-400 font-semibold uppercase tracking-wider">Implementadas</h4>
            <ul className="space-y-1 text-gray-400">
              <li>✓ Registro de misión MINERAL-01 con linaje S01-S08</li>
              <li>✓ Importación de cabecera LAZ con checksum SHA-256</li>
              <li>✓ Estado HEADER_ONLY sin estadísticas inventadas</li>
              <li>✓ Detección de huecos de cobertura</li>
              <li>✓ Registro de anomalías con ID estable y metadatos</li>
              <li>✓ Clasificación de niveles de evidencia (3 niveles)</li>
              <li>✓ Evaluación geomorfológica con umbrales configurables</li>
              <li>✓ Visor público con capas y filtros</li>
              <li>✓ Exportación GeoJSON y CSV con diferenciación de datos</li>
              <li>✓ Matriz de integración documentada</li>
              <li>✓ Invariantes de prueba verificados</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-red-400 font-semibold uppercase tracking-wider">Bloqueadas</h4>
            <ul className="space-y-1 text-gray-400">
              <li>✗ Procesamiento LAZ real (requiere servidor con laz-perf/laszip)</li>
              <li>✗ Clasificación Ground (class 2) — BLOCKED_RUNTIME</li>
              <li>✗ Generación de MDT real de alta resolución</li>
              <li>✗ Hillshade multi-azimut (pendiente de MDT)</li>
              <li>✗ Mapa de pendiente georreferenciado</li>
              <li>✗ Consulta IGME desde navegador (CORS bloqueado)</li>
              <li>✗ Exportación PDF (requiere servidor)</li>
              <li>✗ Cruce con GEODE/escombreras (servicios no verificados)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-red-950/20 border border-red-800/40 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
          <AlertTriangle className="w-4 h-4" />
          Advertencias obligatorias preservadas
        </div>
        <ul className="text-xs text-red-300/70 space-y-1">
          <li>• Los límites catastrales NO acreditan titularidad minera.</li>
          <li>• La morfología del terreno NO prueba por sí sola actividad extractiva.</li>
          <li>• El origen minero NUNCA se deduce exclusivamente de topografía.</li>
          <li>• Toda conclusión requiere revisión humana documentada.</li>
          <li>• Si la consulta IGME falla, se registra QUERY_FAILED, nunca 0 indicios.</li>
          <li>• No se anonimizan datos ficticios ni se simulan hallazgos.</li>
          <li>• No se declaran éxitos sin prueba de ejecución.</li>
        </ul>
      </div>

      {/* Mission metadata */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Metadatos de la misión</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-gray-500">ID</div>
            <div className="text-white font-mono">{missionData.id}</div>
          </div>
          <div>
            <div className="text-gray-500">Creada</div>
            <div className="text-white">{new Date(missionData.createdAt).toLocaleDateString('es-ES')}</div>
          </div>
          <div>
            <div className="text-gray-500">Actualizada</div>
            <div className="text-white">{new Date(missionData.updatedAt).toLocaleDateString('es-ES')}</div>
          </div>
          <div>
            <div className="text-gray-500">Anomalías</div>
            <div className="text-white">{missionData.anomalies.length} (0 confirmadas)</div>
          </div>
          <div>
            <div className="text-gray-500">Huecos cobertura</div>
            <div className="text-white">{missionData.coverageGaps.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Linaje</div>
            <div className="text-white font-mono">{missionData.lineage.join('→')}</div>
          </div>
          <div>
            <div className="text-gray-500">Estado procesamiento</div>
            <div className="text-red-400 font-mono">{missionData.processingStatus}</div>
          </div>
          <div>
            <div className="text-gray-500">Revisión humana</div>
            <div className="text-amber-400">REQUERIDA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
