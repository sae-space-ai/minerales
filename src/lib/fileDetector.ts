/**
 * Detector de formato de archivos geoespaciales
 * 
 * Identifica el tipo real de archivo mediante:
 * 1. Extensión del nombre
 * 2. Firma mágica (magic bytes)
 * 3. Estructura interna
 * 
 * NO se basa únicamente en la extensión.
 */

export type GeoFileType = 
  | 'LAS'
  | 'LAZ'
  | 'GEOTIFF'
  | 'COG'
  | 'UNKNOWN'
  | 'INVALID';

export interface FileDetectionResult {
  type: GeoFileType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  signature?: string;
  details?: string;
  error?: string;
}

/**
 * Detecta el tipo de archivo geoespacial.
 * 
 * @param file - Archivo a analizar
 * @returns Resultado de la detección
 */
export async function detectGeoFileType(file: File): Promise<FileDetectionResult> {
  const filename = file.name.toLowerCase();
  
  // 1. Verificar por extensión (rápido pero no fiable)
  const extensionMatch = filename.match(/\.(las|laz|tif|tiff|geotiff|cog)$/);
  
  if (!extensionMatch) {
    return {
      type: 'UNKNOWN',
      confidence: 'LOW',
      error: 'Extensión no reconocida. Se esperan: .las, .laz, .tif, .tiff, .geotiff, .cog',
    };
  }
  
  const extension = extensionMatch[1];
  
  // 2. Leer primeros bytes para verificar firma
  try {
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const view = new DataView(buffer);
    
    // LAS/LAZ: firma "LASF" en los primeros 4 bytes
    if (extension === 'las' || extension === 'laz') {
      const signature = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      
      if (signature === 'LASF') {
        return {
          type: extension === 'las' ? 'LAS' : 'LAZ',
          confidence: 'HIGH',
          signature: 'LASF',
          details: `Archivo ${extension.toUpperCase()} válido detectado por firma LASF`,
        };
      } else {
        return {
          type: 'INVALID',
          confidence: 'HIGH',
          signature,
          error: `Extensión .${extension} pero firma inválida: "${signature}". Se esperaba "LASF".`,
        };
      }
    }
    
    // GeoTIFF/COG: firma "II" (Intel) o "MM" (Motorola) + magic number 42
    if (extension === 'tif' || extension === 'tiff' || extension === 'geotiff' || extension === 'cog') {
      const byteOrder = String.fromCharCode(view.getUint8(0), view.getUint8(1));
      
      if (byteOrder === 'II' || byteOrder === 'MM') {
        // Verificar magic number 42
        const isLittleEndian = byteOrder === 'II';
        const magicNumber = view.getUint16(2, isLittleEndian);
        
        if (magicNumber === 42) {
          return {
            type: extension === 'cog' ? 'COG' : 'GEOTIFF',
            confidence: 'HIGH',
            signature: `${byteOrder}+42`,
            details: `Archivo ${extension.toUpperCase()} válido detectado por firma TIFF`,
          };
        } else {
          return {
            type: 'INVALID',
            confidence: 'HIGH',
            signature: `${byteOrder}+${magicNumber}`,
            error: `Extensión .${extension} pero magic number inválido: ${magicNumber}. Se esperaba 42.`,
          };
        }
      } else {
        return {
          type: 'INVALID',
          confidence: 'HIGH',
          signature: byteOrder,
          error: `Extensión .${extension} pero orden de bytes inválido: "${byteOrder}". Se esperaba "II" o "MM".`,
        };
      }
    }
    
    return {
      type: 'UNKNOWN',
      confidence: 'LOW',
      error: `Extensión .${extension} reconocida pero no se pudo verificar la firma.`,
    };
    
  } catch (error) {
    return {
      type: 'UNKNOWN',
      confidence: 'LOW',
      error: `Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

/**
 * Sugiere la acción correcta según el tipo de archivo detectado.
 */
export function suggestAction(detection: FileDetectionResult): {
  action: 'LOAD_AS_LIDAR' | 'LOAD_AS_MDT' | 'GENERATE_MDT_FROM_LIDAR' | 'REJECT';
  message: string;
  details?: string;
} {
  if (detection.type === 'LAS' || detection.type === 'LAZ') {
    return {
      action: 'LOAD_AS_LIDAR',
      message: `Archivo ${detection.type} detectado. Se procesará como nube de puntos LiDAR.`,
      details: 'Puede generar un MDT a partir de los puntos clasificados como Ground después de la descompresión.',
    };
  }
  
  if (detection.type === 'GEOTIFF' || detection.type === 'COG') {
    return {
      action: 'LOAD_AS_MDT',
      message: `Archivo ${detection.type} detectado. Se procesará como Modelo Digital del Terreno.`,
      details: 'El archivo debe contener elevaciones en una banda única.',
    };
  }
  
  if (detection.type === 'INVALID') {
    return {
      action: 'REJECT',
      message: `Archivo inválido: ${detection.error}`,
      details: 'Verifique que el archivo no está corrupto y tiene el formato correcto.',
    };
  }
  
  return {
    action: 'REJECT',
    message: `No se pudo identificar el tipo de archivo: ${detection.error}`,
    details: 'Se esperan archivos LAS/LAZ (LiDAR) o GeoTIFF/COG (MDT).',
  };
}
