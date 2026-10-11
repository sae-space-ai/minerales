import { missionData, MISSION_AREA } from '../data/missionData';
import { Download, FileJson, FileSpreadsheet, AlertTriangle } from 'lucide-react';

function downloadFile(name:string, mime:string, contents:string) {
  const blob=new Blob([contents],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function ExportPanel() {
  const downloadGeojson=()=>{
    // GeoJSON RFC 7946 requires WGS84 lon/lat. No inferred mine/anomaly geometries.
    const data={
      type:'FeatureCollection',
      metadata:{
        mission:'MINERAL-01',
        scientific_state:'NO_CONCLUSIVE',
        coordinate_system:'OGC CRS84 (WGS84 lon/lat)',
        warning:'Solo geometría de envolvente de cabecera y punto provisional de arroyo. No es límite de finca ni inventario minero.',
        verified_mining_findings:null,
        detected_anomalies:null,
        source_laz:missionData.lasStatus.filename,
        original_source_crs:missionData.lasStatus.crsEPSG,
      },
      features:[
        {type:'Feature',id:'LAZ_HEADER_ENVELOPE',
          geometry:{type:'Polygon',coordinates:[MISSION_AREA.verifiedLasEnvelope]},
          properties:{
            category:'ENVELOPE_FROM_LAS_HEADER',
            source_file:missionData.lasStatus.filename,
            source_crs:missionData.lasStatus.crsEPSG,
            points_declared:missionData.lasStatus.pointCount,
            actual_lidar_coverage_verified:false,
            mining_evidence:false,
          }},
        {type:'Feature',id:'STREAM_REFERENCE_PROVISIONAL',
          geometry:{type:'Point',coordinates:[MISSION_AREA.center[1],MISSION_AREA.center[0]]},
          properties:{category:'PROVISIONAL_STREAM_REFERENCE',verified_as_cortijo:false,mining_evidence:false}}
      ]
    };
    downloadFile('MINERAL01_metadatos_cobertura_NO_ANOMALIAS.geojson','application/geo+json',JSON.stringify(data,null,2));
  };
  const downloadCsv=()=>{
    const rows=[
      ['campo','valor','estado_evidencia'],
      ['mision',missionData.id,'IDENTIFICADOR'],
      ['referencia_geografica','Punto provisional del arroyo Matarrama','NO_VERIFICADO_COMO_CORTIJO'],
      ['latitud_referencia',String(MISSION_AREA.center[0]),'PROVISIONAL'],
      ['longitud_referencia',String(MISSION_AREA.center[1]),'PROVISIONAL'],
      ['archivo_laz',missionData.lasStatus.filename,'CABECERA_VERIFICADA'],
      ['puntos_declarados',String(missionData.lasStatus.pointCount),'CABECERA_NO_DESCOMPRIMIDO'],
      ['crs_archivo',missionData.lasStatus.crsEPSG,'CABECERA'],
      ['puntos_ground_procesados','NO','NO_EJECUTADO'],
      ['mdt_real_analizado','NO','NO_EJECUTADO'],
      ['anomalías_evaluadas','NO','NO_EVALUADO_NO_EQUIVALE_A_CERO'],
      ['consulta_igme',missionData.igmeStatus.status,'RECUENTO_DESCONOCIDO'],
      ['hallazgos_mineros_confirmados','NO_EVALUADO','NO_CONCLUYENTE'],
    ];
    const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    downloadFile('MINERAL01_estado_evidencias.csv','text/csv;charset=utf-8','\uFEFF'+csv);
  };

  return <div className="space-y-6">
    <h2 className="flex items-center gap-2 text-xl font-bold"><Download className="h-5 w-5 text-cyan-400"/>Exportación de evidencias disponibles</h2>
    <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-4 text-sm text-amber-200">
      <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4"/>No existen anomalías mineras verificadas para exportar</div>
      <p className="mt-2">Los archivos disponibles contienen únicamente metadatos comprobados y geometría de referencia provisional. No contienen excavaciones, minas, zanjas detectadas ni un recuento científico de anomalías.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <FileJson className="mb-2 h-6 w-6 text-sky-300"/>
        <h3 className="font-semibold">GeoJSON de referencia</h3>
        <p className="my-3 text-sm text-gray-400">Envolvente de cabecera LAZ y punto provisional, identificados expresamente como tales.</p>
        <button onClick={downloadGeojson} className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">Descargar GeoJSON</button>
      </div>
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <FileSpreadsheet className="mb-2 h-6 w-6 text-emerald-300"/>
        <h3 className="font-semibold">CSV de estado</h3>
        <p className="my-3 text-sm text-gray-400">Estado verificable de fuentes, datos pendientes y ausencia de análisis ejecutado.</p>
        <button onClick={downloadCsv} className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600">Descargar CSV</button>
      </div>
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h3 className="font-semibold">Informe científico PDF</h3>
        <p className="my-3 text-sm text-gray-400">No disponible: faltan resultados geológicos y contraste con el MDT y el IGME.</p>
        <span className="text-xs text-amber-300">No habilitado</span>
      </div>
    </div>
  </div>;
}
