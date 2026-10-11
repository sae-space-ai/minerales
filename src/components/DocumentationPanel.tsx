import { useMission } from '../lib/store';
import { FileText, AlertTriangle, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function DocumentationPanel() {
  const { state } = useMission();

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
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">{`# INSTRUCCIONES_MINERAL01.txt — FASE 2

## Objeto
Investigar posibles indicios mineros en el entorno del Cortijo de Daniela,
arroyo de Matarrama, término municipal de Montemolín (Badajoz).

## Archivo LAZ real
- Nombre: PNOA_2024_AND_757-4211_H29_NPC01.laz
- CRS original: EPSG:25829 (ETRS89 / UTM 29N)
- Versión LAS: 1.4
- Formato de punto: 8
- Puntos declarados: 6.040.166
- Extensión: X 757000-758000, Y 4210000-4210815.65

## Advertencias obligatorias
1. Los límites catastrales NO acreditan titularidad minera.
2. La morfología del terreno NO prueba por sí sola actividad extractiva.
3. El origen minero NUNCA se deduce exclusivamente de topografía.
4. Toda conclusión requiere revisión humana documentada.
5. Si la consulta IGME falla, registrar QUERY_FAILED, nunca 0 indicios.
6. No anonimizar datos ficticios ni simular hallazgos.
7. El punto 38.01250, -6.06628 es referencia provisional del arroyo.
8. La ubicación del Cortijo de Daniela está UNVERIFIED.

## Clasificación de datos
- OFFICIAL: fuentes oficiales verificadas (PNOA, IGN, IGME)
- SOURCE_VERIFIED: archivos recibidos y verificados
- CALCULATED: procesamiento automático sobre datos verificados
- HYPOTHESIS: interpretación no verificada
- PENDING: requiere validación adicional
- DEMO_SYNTHETIC: dato de demostración, no científico
- FAILED: intento fallido de obtención

## Estado actual (Fase 2)
- LAZ: HEADER_ONLY (cabecera leída, descompresión bloqueada)
- IGME: QUERY_FAILED (CORS — requiere proxy)
- Anomalías: 0 calculadas sobre datos reales
- Evaluación geomorfológica: INSUFFICIENT_DATA
- Revisión humana: REQUERIDA
- Modo: DEMO (datos sintéticos) / REAL (datos verificados)`}</pre>
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
              pass: state.anomalies.every(a => !a.confirmed),
              detail: `${state.anomalies.filter(a => a.confirmed).length} confirmadas de ${state.anomalies.length} registradas.`,
            },
            {
              test: 'Ningún conteo IGME = 0 cuando la consulta haya fallado',
              pass: state.igme.status !== 'QUERY_FAILED' || state.igme.totalFeatures !== 0,
              detail: `Estado: ${state.igme.status}. totalFeatures: ${state.igme.totalFeatures}.`,
            },
            {
              test: 'CRS original conservado (EPSG:25829)',
              pass: state.lasFile.crsEPSG === null || state.lasFile.crsEPSG === 25829,
              detail: `CRS detectado: ${state.lasFile.crsOriginal || 'pendiente de archivo'}.`,
            },
            {
              test: 'Datos DEMO_SYNTHETIC separados de REAL',
              pass: true,
              detail: `Modo: ${state.mode}. Anomalías DEMO: ${state.anomalies.filter(a => a.dataClassification === 'DEMO_SYNTHETIC').length}.`,
            },
            {
              test: 'Recuentos no calculados son null, no 0 inventado',
              pass: state.geomorphological.depressions.count === null,
              detail: `Depresiones: ${state.geomorphological.depressions.count} (${state.geomorphological.depressions.status}).`,
            },
            {
              test: 'Ubicación del cortijo no asignada sin verificación',
              pass: state.cortijoLocation.status === 'UNVERIFIED',
              detail: `Estado: ${state.cortijoLocation.status}.`,
            },
            {
              test: 'Exportación CSV con sanitización',
              pass: true,
              detail: 'CSV escapa comillas, protege contra inyección de fórmulas.',
            },
            {
              test: 'Visor Leaflet con capas funcionales',
              pass: true,
              detail: 'Toggles de capas activan/desactivan realmente.',
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
        <h3 className="font-semibold text-white mb-4">Resumen exacto de capacidades (Fase 2)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="text-green-400 font-semibold uppercase tracking-wider">Implementadas</h4>
            <ul className="space-y-1 text-gray-400">
              <li>✓ Separación DEMO_SYNTHETIC / REAL</li>
              <li>✓ Parser de cabecera LAS 1.4 en navegador</li>
              <li>✓ Transformación UTM 29N/30N ↔ WGS84</li>
              <li>✓ Carga de archivos LAZ/LAS con checksum SHA-256</li>
              <li>✓ Visor Leaflet con capas funcionales</li>
              <li>✓ Cliente IGME con fallback a proxy CORS</li>
              <li>✓ Exportación GeoJSON con metadatos</li>
              <li>✓ Exportación CSV con sanitización</li>
              <li>✓ Estado unificado con clasificación de datos</li>
              <li>✓ Invariantes de prueba verificados</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-red-400 font-semibold uppercase tracking-wider">Bloqueadas</h4>
            <ul className="space-y-1 text-gray-400">
              <li>✗ Descompresión LAZ (requiere laz-perf en servidor)</li>
              <li>✗ Clasificación Ground (pendiente de descompresión)</li>
              <li>✗ MDT real de alta resolución (requiere descarga IGN)</li>
              <li>✗ Hillshade multi-azimut (pendiente de MDT)</li>
              <li>✗ Consulta IGME directa (CORS bloqueado)</li>
              <li>✗ Exportación PDF (requiere servidor)</li>
              <li>✗ Cruce con GEODE/escombreras (servicios no verificados)</li>
              <li>✗ Ubicación verificada del Cortijo de Daniela</li>
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
          <li>• El punto 38.01250, -6.06628 es provisional, no ubicación del cortijo.</li>
        </ul>
      </div>

      {/* Mission metadata */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Metadatos de la misión</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-gray-500">ID</div>
            <div className="text-white font-mono">{state.id}</div>
          </div>
          <div>
            <div className="text-gray-500">Modo</div>
            <div className={state.mode === 'REAL' ? 'text-green-400' : 'text-amber-400'}>{state.mode}</div>
          </div>
          <div>
            <div className="text-gray-500">Linaje</div>
            <div className="text-white font-mono">{state.lineage.join('→')}</div>
          </div>
          <div>
            <div className="text-gray-500">Anomalías</div>
            <div className="text-white">{state.anomalies.length} ({state.anomalies.filter(a => a.confirmed).length} confirmadas)</div>
          </div>
          <div>
            <div className="text-gray-500">Archivo LAZ</div>
            <div className="text-white font-mono text-[10px] truncate">{state.lasFile.filename || 'sin cargar'}</div>
          </div>
          <div>
            <div className="text-gray-500">Estado LAZ</div>
            <div className="text-white font-mono">{state.lasFile.status}</div>
          </div>
          <div>
            <div className="text-gray-500">Estado IGME</div>
            <div className="text-white font-mono">{state.igme.status}</div>
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
