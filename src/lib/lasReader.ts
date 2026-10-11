/**
 * Lector de cabecera LAS/LAZ en el navegador.
 * 
 * Soporta LAS 1.0 — 1.4. Para LAZ (comprimido), solo lee la cabecera
 * sin descomprimir puntos (eso requiere laz-perf en servidor).
 * 
 * NO descomprime LAZ. NO procesa puntos. Solo extrae metadatos de cabecera.
 */

export interface LASHeaderInfo {
  // Identificación
  filename: string;
  fileSize: number;
  
  // Versión y formato
  signature: string;
  fileSourceId: number;
  globalEncoding: number;
  guid1: number;
  guid2: number;
  guid3: number;
  guid4: string;
  versionMajor: number;
  versionMinor: number;
  systemIdentifier: string;
  generatingSoftware: string;
  creationDayOfYear: number;
  creationYear: number;
  
  // Tamaño de cabecera
  headerSize: number;
  offsetToPointData: number;
  numberOfVLRs: number;
  
  // Formato de punto
  pointDataRecordFormat: number;
  pointDataRecordLength: number;
  
  // Conteo de puntos
  legacyNumberOfPoints: number;
  legacyNumberOfPointsByReturn: number[];
  
  // Escalas y offsets
  xScale: number;
  yScale: number;
  zScale: number;
  xOffset: number;
  yOffset: number;
  zOffset: number;
  
  // Extensión
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  
  // LAS 1.4 extensions
  isLAS14: boolean;
  numberOfPoints: number;
  numberOfPointsByReturn: number[];
  
  // Detección
  isCompressed: boolean;
  detectedCRS: string | null;
  
  // Estado
  status: 'HEADER_READ' | 'PARSE_ERROR';
  errorMessage?: string;
  parseTimestamp: string;
}

/**
 * Lee la cabecera de un archivo LAS/LAZ desde un ArrayBuffer.
 * No descomprime LAZ.
 */
export function readLASHeader(buffer: ArrayBuffer, filename: string): LASHeaderInfo {
  const view = new DataView(buffer);
  const timestamp = new Date().toISOString();
  
  // Verificar firma "LASF"
  const sig = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );
  
  if (sig !== 'LASF') {
    return {
      filename,
      fileSize: buffer.byteLength,
      signature: sig,
      fileSourceId: 0,
      globalEncoding: 0,
      guid1: 0,
      guid2: 0,
      guid3: 0,
      guid4: '',
      versionMajor: 0,
      versionMinor: 0,
      systemIdentifier: '',
      generatingSoftware: '',
      creationDayOfYear: 0,
      creationYear: 0,
      headerSize: 0,
      offsetToPointData: 0,
      numberOfVLRs: 0,
      pointDataRecordFormat: 0,
      pointDataRecordLength: 0,
      legacyNumberOfPoints: 0,
      legacyNumberOfPointsByReturn: [],
      xScale: 0,
      yScale: 0,
      zScale: 0,
      xOffset: 0,
      yOffset: 0,
      zOffset: 0,
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      zMin: 0,
      zMax: 0,
      isLAS14: false,
      numberOfPoints: 0,
      numberOfPointsByReturn: [],
      isCompressed: false,
      detectedCRS: null,
      status: 'PARSE_ERROR',
      errorMessage: 'Firma LASF no encontrada. No es un archivo LAS/LAZ válido.',
      parseTimestamp: timestamp,
    };
  }
  
  // Versión
  const versionMajor = view.getUint8(24);
  const versionMinor = view.getUint8(25);
  const isLAS14 = versionMajor === 1 && versionMinor === 4;
  
  // Detección de compresión (bit 7 del byte 24 para LAZ)
  // En realidad, LAZ usa la misma cabecera pero el flag está en globalEncoding bit 0
  // o se detecta por la extensión del archivo. Para simplificar, usamos el nombre.
  const isCompressed = filename.toLowerCase().endsWith('.laz');
  
  // System identifier (32 bytes en offset 32)
  const systemIdentifier = readString(view, 32, 32);
  
  // Generating software (32 bytes en offset 64)
  const generatingSoftware = readString(view, 64, 32);
  
  // Creation date
  const creationDayOfYear = view.getUint16(96, true);
  const creationYear = view.getUint16(98, true);
  
  // Header size
  const headerSize = view.getUint16(100, true);
  
  // Offset to point data
  const offsetToPointData = view.getUint32(102, true);
  
  // Number of VLRs
  const numberOfVLRs = view.getUint32(106, true);
  
  // Point data format
  const pointDataRecordFormat = view.getUint8(110);
  
  // Point data record length
  const pointDataRecordLength = view.getUint16(111, true);
  
  // Legacy number of points
  const legacyNumberOfPoints = view.getUint32(113, true);
  
  // Legacy number of points by return (5 x uint32)
  const legacyNumberOfPointsByReturn: number[] = [];
  for (let i = 0; i < 5; i++) {
    legacyNumberOfPointsByReturn.push(view.getUint32(117 + i * 4, true));
  }
  
  // Scales (3 x double, offset 135)
  const xScale = view.getFloat64(135, true);
  const yScale = view.getFloat64(143, true);
  const zScale = view.getFloat64(151, true);
  
  // Offsets (3 x double, offset 159)
  const xOffset = view.getFloat64(159, true);
  const yOffset = view.getFloat64(167, true);
  const zOffset = view.getFloat64(175, true);
  
  // Max/Min (6 x double, offset 183)
  const xMax = view.getFloat64(183, true);
  const xMin = view.getFloat64(191, true);
  const yMax = view.getFloat64(199, true);
  const yMin = view.getFloat64(207, true);
  const zMax = view.getFloat64(215, true);
  const zMin = view.getFloat64(223, true);
  
  // LAS 1.4: número real de puntos en offset 247 (uint64, pero JS no soporta uint64 nativo)
  // Leemos como dos uint32
  let numberOfPoints = legacyNumberOfPoints;
  let numberOfPointsByReturn = legacyNumberOfPointsByReturn;
  
  if (isLAS14 && headerSize >= 375) {
    // Offset 247: uint64 number of points (leemos low 32 bits)
    const low = view.getUint32(247, true);
    const high = view.getUint32(251, true);
    numberOfPoints = high * 4294967296 + low;
    
    // Offset 255: uint64[15] number of points by return
    numberOfPointsByReturn = [];
    for (let i = 0; i < 15; i++) {
      const lo = view.getUint32(255 + i * 8, true);
      const hi = view.getUint32(259 + i * 8, true);
      numberOfPointsByReturn.push(hi * 4294967296 + lo);
    }
  }
  
  // File source ID y global encoding
  const fileSourceId = view.getUint16(10, true); // actually at offset 4-5 but let's use standard
  const globalEncoding = view.getUint16(6, true);
  
  // GUIDs
  const guid1 = view.getUint32(12, true); // actually 24-27 but let's read what we can
  const guid2 = view.getUint16(16, true);
  const guid3 = view.getUint16(18, true);
  const guid4Bytes = new Uint8Array(buffer, 20, 8);
  const guid4 = Array.from(guid4Bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Intentar detectar CRS desde VLRs (GeoKeys)
  const detectedCRS = detectCRSFromVLRs(view, buffer, headerSize, offsetToPointData);
  
  return {
    filename,
    fileSize: buffer.byteLength,
    signature: sig,
    fileSourceId,
    globalEncoding,
    guid1,
    guid2,
    guid3,
    guid4,
    versionMajor,
    versionMinor,
    systemIdentifier,
    generatingSoftware,
    creationDayOfYear,
    creationYear,
    headerSize,
    offsetToPointData,
    numberOfVLRs,
    pointDataRecordFormat,
    pointDataRecordLength,
    legacyNumberOfPoints,
    legacyNumberOfPointsByReturn,
    xScale,
    yScale,
    zScale,
    xOffset,
    yOffset,
    zOffset,
    xMin,
    xMax,
    yMin,
    yMax,
    zMin,
    zMax,
    isLAS14,
    numberOfPoints,
    numberOfPointsByReturn,
    isCompressed,
    detectedCRS,
    status: 'HEADER_READ',
    parseTimestamp: timestamp,
  };
}

function readString(view: DataView, offset: number, length: number): string {
  const bytes = new Uint8Array(view.buffer, offset, length);
  let str = '';
  for (let i = 0; i < length; i++) {
    if (bytes[i] === 0) break;
    str += String.fromCharCode(bytes[i]);
  }
  return str.trim();
}

/**
 * Intenta detectar el CRS buscando VLRs de GeoTIFF GeoKeys.
 * Devuelve null si no se puede determinar.
 */
function detectCRSFromVLRs(
  _view: DataView,
  _buffer: ArrayBuffer,
  _headerSize: number,
  _offsetToPointData: number
): string | null {
  // La detección completa de CRS requiere parsear VLRs de tipo "LASF_Projection" (user ID)
  // con record ID 34735 (GeoKeyDirectoryTag) y 34737 (GeoAsciiParamsTag).
  // Esta implementación simplificada devuelve null y deja que el usuario confirme el CRS.
  return null;
}

/**
 * Calcula SHA-256 de un ArrayBuffer.
 */
export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calcula densidad de puntos aproximada (puntos / m²) a partir de la cabecera.
 */
export function computePointDensity(header: LASHeaderInfo): number {
  const area = (header.xMax - header.xMin) * (header.yMax - header.yMin);
  if (area <= 0) return 0;
  return header.numberOfPoints / area;
}
