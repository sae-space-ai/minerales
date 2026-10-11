import { exportFormats, missionData } from '../data/missionData';
import { Download, FileJson, FileSpreadsheet, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function ExportPanel() {
  const formatIcons = {
    GeoJSON: <FileJson className="w-5 h-5 text-green-400" />,
    CSV: <FileSpreadsheet className="w-5 h-5 text-blue-400" />,
    PDF: <FileText className="w-5 h-5 text-red-400" />,
  };

  const handleExport = (format: string) => {
    if (format === 'GeoJSON') {
      const geojson = {
        type: 'FeatureCollection',
        features: missionData.anomalies.map((a) => ({
          type: 'Feature',
          id: a.id,
          geometry: a.geometry,
          properties: {
            dimensions: a.dimensions,
            elevation: a.elevation,
            sourceFile: a.sourceFile,
            methodology: a.methodology,
            sourceFingerprint: a.sourceFingerprint,
            evidenceLevel: a.evidenceLevel,
            alternativeInterpretations: a.alternativeInterpretations,
            distanceToChannel: a.distanceToChannel,
            igmeRecord: a.igmeRecord,
            confidence: a.confidence,
            confirmed: a.confirmed,
            // Diferenciación de datos
            dataClassification: {
              official: a.igmeRecord === 'VERIFIED',
              calculated: ['TOPOGRAPHIC_OBS'].includes(a.evidenceLevel),
              hypothesis: ['HUMAN_ACTIVITY_HYPOTHESIS'].includes(a.evidenceLevel),
              pending: !a.confirmed,
            },
          },
        })),
      };
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MINERAL-01_anomalies.geojson';
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'CSV') {
      const headers = ['id', 'evidenceLevel', 'dimensions_l', 'dimensions_w', 'dimensions_d', 'elevation', 'methodology', 'confidence', 'igmeRecord', 'confirmed', 'data_official', 'data_calculated', 'data_hypothesis', 'data_pending'];
      const rows = missionData.anomalies.map((a) => [
        a.id,
        a.evidenceLevel,
        a.dimensions.length,
        a.dimensions.width,
        a.dimensions.depth,
        a.elevation,
        `"${a.methodology}"`,
        a.confidence,
        a.igmeRecord,
        a.confirmed,
        a.igmeRecord === 'VERIFIED',
        a.evidenceLevel === 'TOPOGRAPHIC_OBS',
        a.evidenceLevel === 'HUMAN_ACTIVITY_HYPOTHESIS',
        !a.confirmed,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MINERAL-01_anomalies.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">Exportación de Datos</h2>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-4">
        <p className="text-xs text-emerald-300/80">
          Cada exportación diferencia explícitamente entre: <strong>dato oficial</strong> (fuentes verificadas),
          <strong> dato calculado</strong> (procesamiento automático), <strong>hipótesis</strong> (interpretación no verificada),
          y <strong>dato pendiente</strong> (requiere validación adicional).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportFormats.map((fmt) => (
          <div key={fmt.format} className="bg-gray-900 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              {formatIcons[fmt.format]}
              <span className="font-semibold text-white">{fmt.format}</span>
              {fmt.available ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 ml-auto" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-[10px] text-gray-500 uppercase">Diferenciación de datos</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1">
                  {fmt.differentiates.official ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">Oficial</span>
                </div>
                <div className="flex items-center gap-1">
                  {fmt.differentiates.calculated ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">Calculado</span>
                </div>
                <div className="flex items-center gap-1">
                  {fmt.differentiates.hypothesis ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">Hipótesis</span>
                </div>
                <div className="flex items-center gap-1">
                  {fmt.differentiates.pending ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">Pendiente</span>
                </div>
              </div>
            </div>

            {fmt.available && fmt.format !== 'PDF' && (
              <button
                onClick={() => handleExport(fmt.format)}
                className="w-full px-3 py-2 bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-600/50 rounded-lg text-sm text-emerald-300 transition-colors"
              >
                Descargar {fmt.format}
              </button>
            )}
            {fmt.format === 'PDF' && (
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-500 text-center">
                Requiere servidor (no en navegador)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data Provenance */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Procedencia de cada afirmación</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-green-400 font-mono min-w-[120px]">LAS HEADER</span>
            <span className="text-gray-400">Cabecera del archivo LAZ PNOA. Verificado con checksum SHA-256. Origen: CNIG.</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-amber-400 font-mono min-w-[120px]">ANOMALÍAS</span>
            <span className="text-gray-400">Calculadas a partir de MDT interpolado. NO son datos oficiales. Nivel: observación topográfica o hipótesis.</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-red-400 font-mono min-w-[120px]">IGME</span>
            <span className="text-gray-400">Consulta fallida (CORS). No se registran 0 indicios. Estado: QUERY_FAILED.</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-purple-400 font-mono min-w-[120px]">GEOMORFOL.</span>
            <span className="text-gray-400">Evaluación basada en patrones topográficos. No confirma actividad minera. Requiere revisión humana.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
