import { useMission } from '../lib/store';
import { Download, FileJson, FileSpreadsheet, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function ExportPanel() {
  const { state } = useMission();
  const isDemo = state.mode === 'DEMO';

  const exportFormats = [
    {
      format: 'GeoJSON' as const,
      available: true,
      differentiates: { official: true, calculated: true, hypothesis: true, pending: true },
    },
    {
      format: 'CSV' as const,
      available: true,
      differentiates: { official: true, calculated: true, hypothesis: true, pending: true },
    },
    {
      format: 'PDF' as const,
      available: false,
      differentiates: { official: false, calculated: false, hypothesis: false, pending: false },
    },
  ];

  const formatIcons = {
    GeoJSON: <FileJson className="w-5 h-5 text-green-400" />,
    CSV: <FileSpreadsheet className="w-5 h-5 text-blue-400" />,
    PDF: <FileText className="w-5 h-5 text-red-400" />,
  };

  /**
   * Sanitiza un valor para CSV:
   * - Escapa comillas dobles
   * - Envuelve en comillas si contiene comas, saltos de línea o comillas
   * - Protege contra inyección de fórmulas (=, +, -, @ al inicio)
   */
  function sanitizeCSVValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    let str = String(value);
    
    // Proteger contra inyección de fórmulas
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str;
    }
    
    // Escapar comillas dobles
    str = str.replace(/"/g, '""');
    
    // Envolver en comillas si es necesario
    if (/[",\n\r]/.test(str)) {
      str = `"${str}"`;
    }
    
    return str;
  }

  const handleExportGeoJSON = () => {
    // Filtrar datos DEMO si estamos en modo REAL
    const anomalies = isDemo
      ? state.anomalies
      : state.anomalies.filter(a => a.dataClassification !== 'DEMO_SYNTHETIC');

    const geojson = {
      type: 'FeatureCollection' as const,
      name: 'MINERAL-01_anomalies',
      crs: {
        type: 'name' as const,
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
      },
      metadata: {
        mission: state.id,
        mode: state.mode,
        exportedAt: new Date().toISOString(),
        lasFile: state.lasFile.filename,
        lasCRS: state.lasFile.crsOriginal,
        totalAnomalies: anomalies.length,
        confirmedAnomalies: anomalies.filter(a => a.confirmed).length,
        dataClassificationSummary: {
          OFFICIAL: anomalies.filter(a => a.dataClassification === 'OFFICIAL').length,
          CALCULATED: anomalies.filter(a => a.dataClassification === 'CALCULATED').length,
          HYPOTHESIS: anomalies.filter(a => a.dataClassification === 'HYPOTHESIS').length,
          DEMO_SYNTHETIC: anomalies.filter(a => a.dataClassification === 'DEMO_SYNTHETIC').length,
          PENDING: anomalies.filter(a => a.dataClassification === 'PENDING').length,
        },
      },
      features: anomalies.map((a) => ({
        type: 'Feature' as const,
        id: a.id,
        geometry: a.geometry,
        properties: {
          classification: a.classification,
          dimensions: a.dimensions,
          elevation: a.elevation,
          sourceFile: a.sourceFile,
          methodology: a.methodology,
          sourceFingerprint: a.sourceFingerprint,
          alternativeInterpretations: a.alternativeInterpretations,
          distanceToChannel: a.distanceToChannel,
          igmeRecord: a.igmeRecord,
          confidence: a.confidence,
          confirmed: a.confirmed,
          humanReviewed: a.humanReviewed,
          dataClassification: a.dataClassification,
          processingTimestamp: a.processingTimestamp,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MINERAL-01_anomalies_${state.mode.toLowerCase()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const anomalies = isDemo
      ? state.anomalies
      : state.anomalies.filter(a => a.dataClassification !== 'DEMO_SYNTHETIC');

    const headers = [
      'id',
      'classification',
      'dataClassification',
      'dim_length_m',
      'dim_width_m',
      'dim_depth_m',
      'elevation_m',
      'methodology',
      'source_file',
      'source_fingerprint',
      'confidence',
      'confirmed',
      'human_reviewed',
      'igme_record',
      'distance_to_channel_m',
      'alternative_interpretations',
      'processing_timestamp',
    ];

    const rows = anomalies.map((a) => [
      sanitizeCSVValue(a.id),
      sanitizeCSVValue(a.classification),
      sanitizeCSVValue(a.dataClassification),
      a.dimensions.length !== null ? sanitizeCSVValue(a.dimensions.length) : '',
      a.dimensions.width !== null ? sanitizeCSVValue(a.dimensions.width) : '',
      a.dimensions.depth !== null ? sanitizeCSVValue(a.dimensions.depth) : '',
      a.elevation !== null ? sanitizeCSVValue(a.elevation) : '',
      sanitizeCSVValue(a.methodology || ''),
      sanitizeCSVValue(a.sourceFile || ''),
      sanitizeCSVValue(a.sourceFingerprint || ''),
      a.confidence !== null ? sanitizeCSVValue(a.confidence) : '',
      sanitizeCSVValue(String(a.confirmed)),
      sanitizeCSVValue(String(a.humanReviewed)),
      sanitizeCSVValue(a.igmeRecord),
      a.distanceToChannel !== null ? sanitizeCSVValue(a.distanceToChannel) : '',
      sanitizeCSVValue(a.alternativeInterpretations.join('; ')),
      sanitizeCSVValue(a.processingTimestamp || ''),
    ]);

    // BOM para UTF-8
    const BOM = '\uFEFF';
    const csv = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MINERAL-01_anomalies_${state.mode.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
          y <strong>dato pendiente</strong> (requiere validación adicional). Los datos{' '}
          <code className="bg-gray-800 px-1 rounded">DEMO_SYNTHETIC</code> se identifican como tales
          {isDemo ? ' y se incluyen en la exportación actual (modo DEMO).' : ' y se excluyen por defecto (modo REAL).'}
        </p>
      </div>

      {isDemo && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3">
          <p className="text-xs text-amber-300/80">
            ⚠️ Modo DEMO activo: las exportaciones incluirán datos sintéticos etiquetados como{' '}
            <code className="bg-gray-800 px-1 rounded">DEMO_SYNTHETIC</code>.
          </p>
        </div>
      )}

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
                {(['official', 'calculated', 'hypothesis', 'pending'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-1">
                    {fmt.differentiates[key] ? (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {fmt.format === 'GeoJSON' && fmt.available && (
              <button
                onClick={handleExportGeoJSON}
                className="w-full px-3 py-2 bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-600/50 rounded-lg text-sm text-emerald-300 transition-colors"
              >
                Descargar GeoJSON
              </button>
            )}
            {fmt.format === 'CSV' && fmt.available && (
              <button
                onClick={handleExportCSV}
                className="w-full px-3 py-2 bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-600/50 rounded-lg text-sm text-emerald-300 transition-colors"
              >
                Descargar CSV
              </button>
            )}
            {fmt.format === 'PDF' && (
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-500 text-center">
                <XCircle className="w-4 h-4 inline mr-1" />
                No implementado — requiere servidor
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
            <span className="text-gray-400">Cabecera del archivo LAZ cargado. Verificado con checksum SHA-256. Origen: archivo del usuario.</span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-amber-400 font-mono min-w-[120px]">ANOMALÍAS</span>
            <span className="text-gray-400">
              {state.anomalies.length > 0 && state.anomalies[0].dataClassification === 'DEMO_SYNTHETIC'
                ? 'DEMO SYNTHETIC — datos de demostración, no científicos.'
                : 'Pendientes de procesamiento sobre MDT real. Ninguna confirmada.'}
            </span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-red-400 font-mono min-w-[120px]">IGME</span>
            <span className="text-gray-400">
              Estado: {state.igme.status}.
              {state.igme.totalFeatures !== null
                ? ` Indicios: ${state.igme.totalFeatures}.`
                : ' No se devuelve 0 cuando la consulta falla.'}
            </span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded">
            <span className="text-purple-400 font-mono min-w-[120px]">GEOMORFOL.</span>
            <span className="text-gray-400">Evaluación: {state.geomorphological.conclusion.replace(/_/g, ' ')}. Requiere revisión humana.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
