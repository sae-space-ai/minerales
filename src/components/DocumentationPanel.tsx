import { missionData, INSTRUCTIONS_MINERAL01 } from '../data/missionData';
import { AlertTriangle, ClipboardCheck, FileText, XCircle } from 'lucide-react';

export default function DocumentationPanel() {
  const missing = [
    {key:'las',title:'Lectura de puntos LAZ y clasificación Ground',status:'NO EJECUTADO',detail:'Solo se ha documentado la cabecera. No existe DTM ni métricas de puntos de suelo en esta aplicación.'},
    {key:'location',title:'Posición del Cortijo de Daniela',status:'NO VERIFICADO',detail:'El punto amarillo identifica una referencia provisional del arroyo, nunca el edificio.'},
    {key:'terrain',title:'Detección de depresiones, zanjas o escombreras',status:'NO EVALUADO',detail:'No se ha utilizado un MDT real de esta localización.'},
    {key:'igme',title:'Consulta espacial oficial al IGME',status:missionData.igmeStatus.status,detail:'Sin consulta verificada en este repositorio, el recuento es desconocido, no cero.'},
    {key:'integration',title:'Integración con FIRECYCLE y GEOOBS-AI',status:'PENDIENTE',detail:'No existe todavía conexión funcional con ambos repositorios desde este frontend.'},
    {key:'review',title:'Validación geológica humana',status:'PENDIENTE',detail:'No hay observaciones geológicas aprobadas ni hallazgos mineros verificados.'},
  ];

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-bold"><FileText className="h-5 w-5 text-cyan-300"/>Documentación y evidencia</h2>
      <section className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-5">
        <div className="flex items-center gap-2 font-semibold text-amber-300"><AlertTriangle className="h-5 w-5"/>Investigación no concluyente</div>
        <p className="mt-2 text-sm text-gray-300">No se ha acreditado la existencia ni la ausencia de minas en el Cortijo de Daniela. La ausencia de observaciones georreferenciadas NO representa un análisis con cero hallazgos.</p>
        <p className="mt-2 text-sm text-gray-300">LAZ disponible: <code>{missionData.lasStatus.filename}</code>. Recuento declarado en cabecera: {missionData.lasStatus.pointCount.toLocaleString('es-ES')} puntos. CRS del LAZ: {missionData.lasStatus.crsEPSG}.</p>
      </section>
      <section className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold"><ClipboardCheck className="h-5 w-5"/>Matriz de comprobaciones reales</h3>
        <div className="space-y-3">
          {missing.map(m=><div key={m.key} className="flex items-start gap-3 rounded-lg border border-gray-800 p-3">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"/>
            <div><p className="text-sm font-semibold">{m.title} <span className="ml-1 text-xs font-normal text-amber-300">({m.status})</span></p>
              <p className="mt-1 text-xs text-gray-400">{m.detail}</p></div>
          </div>)}
        </div>
      </section>
      <section className="rounded-xl border border-gray-700 bg-gray-900 p-5">
        <h3 className="mb-3 font-semibold">Protocolo científico de MINERAL-01</h3>
        <pre className="whitespace-pre-wrap break-words text-xs text-gray-300">{INSTRUCTIONS_MINERAL01.trim()}</pre>
      </section>
      <section className="rounded-xl border border-gray-700 bg-gray-900 p-5 text-sm text-gray-400">
        <h3 className="mb-2 font-semibold text-gray-200">Qué permite afirmar esta versión</h3>
        <p>Existe una interfaz cartográfica y un conjunto de metadatos que describen la cabecera de un LAZ aportado. No existe conexión funcional a la base IGME desde este frontend, ni análisis del relieve real, ni exportación de anomalías reales. El mapa es un instrumento de reconocimiento documental, no un dictamen minero.</p>
      </section>
    </div>
  );
}
