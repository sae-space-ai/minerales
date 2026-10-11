/**
 * Motor IA determinista MINERAL-AI.
 * 
 * Interpreta instrucciones de investigación en lenguaje natural
 * y las ejecuta usando los motores existentes (LAZ, MDT, IGME).
 * 
 * NO usa modelos remotos. NO inventa resultados científicos.
 * Es un orquestador determinista basado en reglas.
 */

import { MDTData, detectDepressions, detectLinearStructures } from './mdtProcessor';
import { MissionState, Anomaly, AnomalyClassification } from './store';

export interface AICommand {
  id: string;
  raw: string;
  parsed: ParsedCommand;
  timestamp: string;
}

export interface ParsedCommand {
  type: 'ANALYZE_DEPRESSIONS' | 'SEARCH_LINEAR' | 'COMPARE_MINING' | 
        'GENERATE_REPORT' | 'IDENTIFY_REVIEW' | 'INVENTORY_GEOJSON' |
        'UNKNOWN';
  parameters: Record<string, any>;
  confidence: number;
}

export interface AIExecutionResult {
  commandId: string;
  success: boolean;
  tool: string;
  input: Record<string, any>;
  output: any;
  errors: string[];
  timestamp: string;
  duration: number;
}

/**
 * Interpreta una instrucción en lenguaje natural.
 */
export function parseCommand(raw: string): ParsedCommand {
  const lower = raw.toLowerCase();
  
  // Depresiones
  if (lower.includes('depres') || lower.includes('sumidero') || lower.includes('hoyo')) {
    const minDepthMatch = lower.match(/(\d+\.?\d*)\s*m/);
    return {
      type: 'ANALYZE_DEPRESSIONS',
      parameters: {
        minDepth: minDepthMatch ? parseFloat(minDepthMatch[1]) : 1.5,
        minArea: 25,
      },
      confidence: 0.9,
    };
  }
  
  // Estructuras lineales
  if (lower.includes('lineal') || lower.includes('zanja') || lower.includes('trinchera') || lower.includes('arroyo')) {
    return {
      type: 'SEARCH_LINEAR',
      parameters: {
        minDepth: 1.0,
        minLength: 20,
      },
      confidence: 0.85,
    };
  }
  
  // Comparar con minería
  if (lower.includes('miner') || lower.includes('indicio') || lower.includes('igme')) {
    return {
      type: 'COMPARE_MINING',
      parameters: {},
      confidence: 0.8,
    };
  }
  
  // Informe
  if (lower.includes('informe') || lower.includes('report') || lower.includes('anomal')) {
    return {
      type: 'GENERATE_REPORT',
      parameters: {
        includeUnconfirmed: lower.includes('no confirm') || lower.includes('pendiente'),
      },
      confidence: 0.85,
    };
  }
  
  // Revisión humana
  if (lower.includes('revis') || lower.includes('humano') || lower.includes('inspección')) {
    return {
      type: 'IDENTIFY_REVIEW',
      parameters: {},
      confidence: 0.9,
    };
  }
  
  // Inventario GeoJSON
  if (lower.includes('geojson') || lower.includes('inventario') || lower.includes('export')) {
    return {
      type: 'INVENTORY_GEOJSON',
      parameters: {},
      confidence: 0.85,
    };
  }
  
  return {
    type: 'UNKNOWN',
    parameters: {},
    confidence: 0,
  };
}

/**
 * Ejecuta un comando interpretado contra el estado actual de la misión.
 */
export function executeCommand(
  command: ParsedCommand,
  state: MissionState,
  mdt: MDTData | null
): AIExecutionResult {
  const startTime = performance.now();
  const errors: string[] = [];
  let output: any = null;
  let tool = '';
  
  switch (command.type) {
    case 'ANALYZE_DEPRESSIONS': {
      tool = 'mdtProcessor.detectDepressions';
      if (!mdt) {
        errors.push('No hay MDT cargado. Importe un GeoTIFF oficial del IGN-CNIG.');
        break;
      }
      const depressions = detectDepressions(
        mdt,
        command.parameters.minDepth,
        command.parameters.minArea
      );
      output = {
        count: depressions.length,
        depressions: depressions.map(d => ({
          id: d.id,
          center: d.center,
          depth: d.depth.toFixed(2),
          area: d.area.toFixed(2),
        })),
      };
      break;
    }
    
    case 'SEARCH_LINEAR': {
      tool = 'mdtProcessor.detectLinearStructures';
      if (!mdt) {
        errors.push('No hay MDT cargado.');
        break;
      }
      const structures = detectLinearStructures(
        mdt,
        command.parameters.minDepth,
        command.parameters.minLength
      );
      output = {
        count: structures.length,
        structures: structures.map(s => ({
          id: s.id,
          startPoint: s.startPoint,
          endPoint: s.endPoint,
          length: s.length.toFixed(2),
          depth: s.depth.toFixed(2),
          orientation: s.orientation.toFixed(1),
        })),
      };
      break;
    }
    
    case 'COMPARE_MINING': {
      tool = 'igmeClient.correlate';
      output = {
        igmeStatus: state.igme.status,
        igmeFeatures: state.igme.features.length,
        anomalies: state.anomalies.length,
        note: 'La correlación espacial requiere datos IGME reales y anomalías procesadas.',
      };
      if (state.igme.status === 'QUERY_FAILED') {
        errors.push('Consulta IGME fallida. No se puede correlacionar.');
      }
      break;
    }
    
    case 'GENERATE_REPORT': {
      tool = 'reportGenerator';
      const anomalies = command.parameters.includeUnconfirmed
        ? state.anomalies
        : state.anomalies.filter(a => a.confirmed);
      output = {
        title: 'Informe de anomalías MINERAL-01',
        date: new Date().toISOString(),
        totalAnomalies: anomalies.length,
        confirmed: anomalies.filter(a => a.confirmed).length,
        pending: anomalies.filter(a => !a.confirmed).length,
        mode: state.mode,
        lasFile: state.lasFile.filename,
        igmeStatus: state.igme.status,
      };
      break;
    }
    
    case 'IDENTIFY_REVIEW': {
      tool = 'reviewQueue';
      const needsReview = state.anomalies.filter(a => !a.humanReviewed);
      output = {
        count: needsReview.length,
        items: needsReview.map(a => ({
          id: a.id,
          classification: a.classification,
          confidence: a.confidence,
          reason: 'Sin revisión humana',
        })),
      };
      break;
    }
    
    case 'INVENTORY_GEOJSON': {
      tool = 'exporter.geojson';
      output = {
        type: 'FeatureCollection',
        features: state.anomalies.map(a => ({
          type: 'Feature',
          id: a.id,
          geometry: a.geometry,
          properties: {
            classification: a.classification,
            confirmed: a.confirmed,
            humanReviewed: a.humanReviewed,
            dataClassification: a.dataClassification,
          },
        })),
      };
      break;
    }
    
    case 'UNKNOWN':
    default: {
      tool = 'none';
      errors.push('Comando no reconocido. Pruebe: "analiza depresiones", "busca estructuras lineales", "compara con IGME", "genera informe", "identifica revisión humana", "inventario GeoJSON".');
      break;
    }
  }
  
  return {
    commandId: `cmd-${Date.now()}`,
    success: errors.length === 0,
    tool,
    input: command.parameters,
    output,
    errors,
    timestamp: new Date().toISOString(),
    duration: performance.now() - startTime,
  };
}

/**
 * Genera una respuesta en lenguaje natural a partir del resultado.
 */
export function formatResult(result: AIExecutionResult): string {
  if (!result.success) {
    return `❌ Error: ${result.errors.join('; ')}`;
  }
  
  switch (result.tool) {
    case 'mdtProcessor.detectDepressions':
      return `✅ Se detectaron ${result.output.count} depresiones candidatas en el MDT. ` +
        `Profundidad mínima: ${result.output.depressions[0]?.depth || 'N/A'}m. ` +
        `Recuerde: estas son observaciones topográficas, no confirmaciones de actividad minera.`;
    
    case 'mdtProcessor.detectLinearStructures':
      return `✅ Se detectaron ${result.output.count} estructuras lineales candidatas. ` +
        `Estas pueden corresponder a zanjas, caminos, linderos o canales. ` +
        `Requieren validación con ortofoto histórica.`;
    
    case 'igmeClient.correlate':
      return `📊 Estado IGME: ${result.output.igmeStatus}. ` +
        `Registros: ${result.output.igmeFeatures}. Anomalías: ${result.output.anomalies}. ` +
        `${result.output.note}`;
    
    case 'reportGenerator':
      return `📋 Informe generado: ${result.output.totalAnomalies} anomalías totales, ` +
        `${result.output.confirmed} confirmadas, ${result.output.pending} pendientes. ` +
        `Modo: ${result.output.mode}.`;
    
    case 'reviewQueue':
      return `👁️ ${result.output.count} elementos requieren revisión humana. ` +
        `Ninguna anomalía puede confirmarse sin validación experta.`;
    
    case 'exporter.geojson':
      return `📦 Inventario GeoJSON generado con ${result.output.features.length} elementos.`;
    
    default:
      return `Resultado: ${JSON.stringify(result.output)}`;
  }
}
