/**
 * Generador de informes PDF con jsPDF.
 * 
 * Desbloquea: exportación PDF operativa.
 * Diferencia datos oficiales, calculados, hipótesis y pendientes.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MissionState } from './store';

export interface PDFReportOptions {
  title: string;
  includeAnomalies: boolean;
  includeLASInfo: boolean;
  includeIGMEInfo: boolean;
  includeGeomorphology: boolean;
  includeMethodology: boolean;
}

/**
 * Genera un informe PDF de la misión MINERAL-01.
 */
export function generateMissionPDF(
  state: MissionState,
  options: PDFReportOptions = {
    title: 'Informe MINERAL-01',
    includeAnomalies: true,
    includeLASInfo: true,
    includeIGMEInfo: true,
    includeGeomorphology: true,
    includeMethodology: true,
  }
): Blob {
  const doc = new jsPDF();
  let y = 20;
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text(options.title, 14, y);
  y += 10;
  
  // Subtítulo
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, y);
  y += 5;
  doc.text(`Modo: ${state.mode}`, 14, y);
  y += 10;
  
  // Advertencia
  doc.setFontSize(9);
  doc.setTextColor(180, 0, 0);
  doc.text('ADVERTENCIA: Este informe no acredita titularidad minera ni derechos de explotación.', 14, y);
  y += 4;
  doc.text('Toda conclusión requiere revisión humana documentada.', 14, y);
  y += 10;
  
  // Información de la misión
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Información de la Misión', 14, y);
  y += 6;
  
  doc.setFontSize(9);
  doc.text(`ID: ${state.id}`, 14, y); y += 4;
  doc.text(`Nombre: ${state.name}`, 14, y); y += 4;
  doc.text(`Linaje: ${state.lineage.join(' → ')}`, 14, y); y += 4;
  doc.text(`Creada: ${new Date(state.createdAt).toLocaleString('es-ES')}`, 14, y); y += 4;
  doc.text(`Actualizada: ${new Date(state.updatedAt).toLocaleString('es-ES')}`, 14, y); y += 8;
  
  // LAS Info
  if (options.includeLASInfo) {
    doc.setFontSize(12);
    doc.text('2. Archivo LAZ/LAS', 14, y);
    y += 6;
    
    doc.setFontSize(9);
    if (state.lasFile.filename) {
      doc.text(`Archivo: ${state.lasFile.filename}`, 14, y); y += 4;
      doc.text(`Tamaño: ${state.lasFile.fileSize ? (state.lasFile.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`, 14, y); y += 4;
      doc.text(`Estado: ${state.lasFile.status}`, 14, y); y += 4;
      doc.text(`CRS: ${state.lasFile.crsOriginal || 'Desconocido'}`, 14, y); y += 4;
      doc.text(`Puntos: ${state.lasFile.pointCount?.toLocaleString() || 'N/A'}`, 14, y); y += 4;
      doc.text(`Versión LAS: ${state.lasFile.lasVersion || 'N/A'}`, 14, y); y += 4;
      if (state.lasFile.checksumSHA256) {
        doc.text(`SHA-256: ${state.lasFile.checksumSHA256.slice(0, 40)}...`, 14, y); y += 4;
      }
    } else {
      doc.text('Ningún archivo cargado.', 14, y); y += 4;
    }
    y += 6;
  }
  
  // IGME Info
  if (options.includeIGMEInfo) {
    doc.setFontSize(12);
    doc.text('3. Consulta IGME', 14, y);
    y += 6;
    
    doc.setFontSize(9);
    doc.text(`Estado: ${state.igme.status}`, 14, y); y += 4;
    doc.text(`Endpoint: ${state.igme.endpoint.slice(0, 60)}...`, 14, y); y += 4;
    if (state.igme.totalFeatures !== null) {
      doc.text(`Indicios: ${state.igme.totalFeatures}`, 14, y); y += 4;
    } else {
      doc.text('Indicios: null (consulta no exitosa)', 14, y); y += 4;
    }
    if (state.igme.errorMessage) {
      doc.setTextColor(180, 0, 0);
      doc.text(`Error: ${state.igme.errorMessage.slice(0, 80)}`, 14, y); y += 4;
      doc.setTextColor(0, 0, 0);
    }
    y += 6;
  }
  
  // Geomorphology
  if (options.includeGeomorphology) {
    doc.setFontSize(12);
    doc.text('4. Evaluación Geomorfológica', 14, y);
    y += 6;
    
    doc.setFontSize(9);
    doc.text(`Conclusión: ${state.geomorphological.conclusion.replace(/_/g, ' ')}`, 14, y); y += 4;
    doc.text(`Depresiones: ${state.geomorphological.depressions.count ?? 'null'} (${state.geomorphological.depressions.status})`, 14, y); y += 4;
    doc.text(`Zanjas: ${state.geomorphological.trenches.count ?? 'null'} (${state.geomorphological.trenches.status})`, 14, y); y += 4;
    doc.text(`Escombreras: ${state.geomorphological.spoilHeaps.count ?? 'null'} (${state.geomorphological.spoilHeaps.status})`, 14, y); y += 4;
    doc.text(`Cortes: ${state.geomorphological.cuts.count ?? 'null'} (${state.geomorphological.cuts.status})`, 14, y); y += 4;
    y += 6;
  }
  
  // Anomalies
  if (options.includeAnomalies && state.anomalies.length > 0) {
    doc.setFontSize(12);
    doc.text('5. Anomalías', 14, y);
    y += 6;
    
    const tableData = state.anomalies.map(a => [
      a.id,
      a.classification.replace(/_/g, ' ').slice(0, 20),
      a.dataClassification,
      a.confidence !== null ? `${(a.confidence * 100).toFixed(0)}%` : 'null',
      a.confirmed ? 'Sí' : 'No',
      a.humanReviewed ? 'Sí' : 'No',
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['ID', 'Clasificación', 'Datos', 'Confianza', 'Conf.', 'Rev.Humana']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7 },
      headStyles: { fillColor: [0, 51, 102] },
    });
    
    y = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Methodology
  if (options.includeMethodology) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text('6. Metodología y Limitaciones', 14, y);
    y += 6;
    
    doc.setFontSize(9);
    const methodology = [
      '• Los datos se clasifican como: OFFICIAL, SOURCE_VERIFIED, CALCULATED, HYPOTHESIS, PENDING, DEMO_SYNTHETIC, FAILED.',
      '• Las anomalías se clasifican como: GEOMETRIC_CANDIDATE, POSSIBLE_ANTHROPIC_FEATURE, DOCUMENTARY_MINING_RECORD,',
      '  SPATIALLY_CORRELATED_CANDIDATE, HUMAN_REVIEWED, MINING_CONFIRMED_WITH_DOCUMENTED_EVIDENCE.',
      '• Ninguna anomalía se confirma sin evidencia documental independiente.',
      '• El origen minero nunca se deduce exclusivamente de morfología.',
      '• Los límites catastrales no acreditan titularidad minera.',
      '• Toda conclusión requiere revisión humana documentada.',
    ];
    
    for (const line of methodology) {
      doc.text(line, 14, y);
      y += 4;
    }
  }
  
  // Footer en todas las páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `MINERAL-01 | sae-space-ai/minerales | Página ${i}/${pageCount} | Revisión humana requerida`,
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  return doc.output('blob');
}

/**
 * Descarga el PDF generado.
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
