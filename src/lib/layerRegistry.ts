/**
 * MINERAL LAYER REGISTRY — Catálogo centralizado de capas geoespaciales
 * 
 * Registro único compartido entre Leaflet 2D y CesiumJS 3D.
 * Cada capa tiene metadatos completos, estado de verificación y compatibilidad.
 * NO inventa servicios ni capas no verificadas.
 */

export type LayerType =
  | 'WMS'
  | 'WMTS'
  | 'WFS'
  | 'WCS'
  | 'OGC_API'
  | 'ARCGIS_REST'
  | 'XYZ'
  | 'VECTOR_TILES'
  | 'GEOJSON'
  | 'KML'
  | 'GEOTIFF'
  | 'COG'
  | 'LAS_LAZ'
  | '3D_TILES'
  | 'CESIUM_TERRAIN'
  | 'USER_IMPORT';

export type LayerCategory =
  | 'BASE_CARTOGRAPHY'
  | 'ORTHOPHOTO'
  | 'SATELLITE'
  | 'LIDAR'
  | 'TERRAIN'
  | 'GEOLOGY'
  | 'MINING'
  | 'HYDROGRAPHY'
  | 'CADASTRE'
  | 'VEGETATION'
  | 'AGRICULTURE'
  | 'ENVIRONMENT'
  | 'FIRES'
  | 'HISTORICAL'
  | 'USER_LAYERS';

export type LayerVerificationStatus =
  | 'DISCOVERED'
  | 'METADATA_VERIFIED'
  | 'DATA_REQUEST_VERIFIED'
  | 'RENDERED_2D'
  | 'RENDERED_3D'
  | 'OPERATIONAL_BOTH'
  | 'NO_COVERAGE'
  | 'REQUIRES_AUTHORIZATION'
  | 'LICENSE_REVIEW_REQUIRED'
  | 'UNAVAILABLE'
  | 'FAILED';

export type LayerCompatibility = {
  leaflet: boolean;
  cesium: boolean;
  microview: boolean;
  notes: string;
};

export interface LayerResolution {
  nativeResolutionMeters: number | null;
  pixelSize: string | null;
  scale: string | null;
  suitableForMicrocell: boolean;
  notes: string;
}

export interface TemporalInfo {
  hasTimeDimension: boolean;
  timeRange: { start: string; end: string; interval: string } | null;
  acquisitionDate: string | null;
  notes: string;
}

export interface LayerLicense {
  attribution: string;
  licenseType: string;
  commercialUse: boolean;
  restrictions: string[];
  url: string | null;
}

export interface MineralLayer {
  id: string;
  officialName: string;
  descriptiveName: string;
  provider: string;
  providerUrl: string;
  serviceUrl: string;
  layerType: LayerType;
  layerId: string;
  category: LayerCategory;
  geographicCoverage: string;
  supportedScales: string[];
  supportedCRS: string[];
  resolution: LayerResolution;
  temporal: TemporalInfo;
  styles: string[];
  transparency: number;
  license: LayerLicense;
  requiresAuth: boolean;
  compatibility: LayerCompatibility;
  verificationStatus: LayerVerificationStatus;
  lastVerified: string;
  provenance: string;
  getFeatureInfo: boolean;
  evidenceType: string;
  enabled: boolean;
  visible: boolean;
  order: number;
  favorite: boolean;
}

/**
 * Catálogo inicial de capas verificadas.
 * Solo incluye capas con verificación real de disponibilidad.
 */
export const VERIFIED_LAYERS: MineralLayer[] = [
  // === CARTOGRAFÍA BASE ===
  {
    id: 'osm-base',
    officialName: 'OpenStreetMap',
    descriptiveName: 'Mapa base mundial OSM',
    provider: 'OpenStreetMap Foundation',
    providerUrl: 'https://www.openstreetmap.org/',
    serviceUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    layerType: 'XYZ',
    layerId: 'osm',
    category: 'BASE_CARTOGRAPHY',
    geographicCoverage: 'Global',
    supportedScales: ['1:1000', '1:5000000'],
    supportedCRS: ['EPSG:3857', 'EPSG:4326'],
    resolution: {
      nativeResolutionMeters: null,
      pixelSize: 'Variable por zoom',
      scale: 'Multi-escala',
      suitableForMicrocell: false,
      notes: 'No apto para análisis métrico detallado',
    },
    temporal: {
      hasTimeDimension: false,
      timeRange: null,
      acquisitionDate: null,
      notes: 'Actualización continua colaborativa',
    },
    styles: ['default'],
    transparency: 1.0,
    license: {
      attribution: '© OpenStreetMap contributors',
      licenseType: 'ODbL',
      commercialUse: true,
      restrictions: ['Requiere atribución', 'Share-alike'],
      url: 'https://www.openstreetmap.org/copyright',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Base cartográfica' },
    verificationStatus: 'OPERATIONAL_BOTH',
    lastVerified: '2026-01-15',
    provenance: 'Servicio público OSM',
    getFeatureInfo: false,
    evidenceType: 'Cartografía colaborativa',
    enabled: true,
    visible: true,
    order: 1,
    favorite: false,
  },
  {
    id: 'esri-world-imagery',
    officialName: 'Esri World Imagery',
    descriptiveName: 'Imagen satelital mundial Esri',
    provider: 'Esri, Maxar, Earthstar Geographics',
    providerUrl: 'https://www.esri.com/',
    serviceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    layerType: 'ARCGIS_REST',
    layerId: 'World_Imagery',
    category: 'BASE_CARTOGRAPHY',
    geographicCoverage: 'Global',
    supportedScales: ['1:1000', '1:18000000'],
    supportedCRS: ['EPSG:3857'],
    resolution: {
      nativeResolutionMeters: 0.3,
      pixelSize: 'Variable (hasta 0.3m en zonas urbanas)',
      scale: 'Multi-escala',
      suitableForMicrocell: true,
      notes: 'Alta resolución en áreas urbanas',
    },
    temporal: {
      hasTimeDimension: false,
      timeRange: null,
      acquisitionDate: null,
      notes: 'Imágenes de diferentes fechas según región',
    },
    styles: ['default'],
    transparency: 1.0,
    license: {
      attribution: 'Esri, Maxar, Earthstar Geographics',
      licenseType: 'Esri Terms',
      commercialUse: false,
      restrictions: ['Uso no comercial en apps públicas', 'Atribución requerida'],
      url: 'https://www.esri.com/legal/software-license-terms',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: true, notes: 'Alta resolución' },
    verificationStatus: 'OPERATIONAL_BOTH',
    lastVerified: '2026-01-15',
    provenance: 'ArcGIS Online',
    getFeatureInfo: false,
    evidenceType: 'Imagen satelital',
    enabled: true,
    visible: true,
    order: 2,
    favorite: false,
  },

  // === ORTOFOTOGRAFÍA IGN ===
  {
    id: 'ign-pnoa-orthophoto',
    officialName: 'OI.OrthoimageCoverage',
    descriptiveName: 'Ortofoto PNOA máxima actualidad',
    provider: 'IGN-CNIG',
    providerUrl: 'https://www.ign.es/',
    serviceUrl: 'https://www.ign.es/wms-inspire/pnoa-ma',
    layerType: 'WMS',
    layerId: 'OI.OrthoimageCoverage',
    category: 'ORTHOPHOTO',
    geographicCoverage: 'España',
    supportedScales: ['1:500', '1:50000'],
    supportedCRS: ['EPSG:25829', 'EPSG:25830', 'EPSG:25831', 'EPSG:4326', 'EPSG:3857'],
    resolution: {
      nativeResolutionMeters: 0.25,
      pixelSize: '0.25m (áreas urbanas) / 0.5m (rural)',
      scale: '1:5000',
      suitableForMicrocell: true,
      notes: 'Alta resolución, apta para microceldas',
    },
    temporal: {
      hasTimeDimension: true,
      timeRange: { start: '2004', end: '2024', interval: 'P1Y' },
      acquisitionDate: '2024',
      notes: 'Vuelo anual, última campaña disponible',
    },
    styles: ['default'],
    transparency: 1.0,
    license: {
      attribution: 'PNOA cedido por © Instituto Geográfico Nacional de España',
      licenseType: 'CC BY 4.0',
      commercialUse: true,
      restrictions: ['Atribución requerida'],
      url: 'https://www.ign.es/web/ign/portal/portal-licencias',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: true, notes: 'Fuente oficial de alta resolución' },
    verificationStatus: 'METADATA_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'IGN WMS Inspire',
    getFeatureInfo: true,
    evidenceType: 'Ortofoto aérea',
    enabled: false,
    visible: false,
    order: 10,
    favorite: false,
  },
  {
    id: 'ign-mapa-raster',
    officialName: 'mtn_raster',
    descriptiveName: 'Mapa Raster IGN (MTN)',
    provider: 'IGN-CNIG',
    providerUrl: 'https://www.ign.es/',
    serviceUrl: 'https://www.ign.es/wms-inspire/mapa-raster',
    layerType: 'WMS',
    layerId: 'mtn_raster',
    category: 'BASE_CARTOGRAPHY',
    geographicCoverage: 'España',
    supportedScales: ['1:5000', '1:50000', '1:200000'],
    supportedCRS: ['EPSG:25829', 'EPSG:25830', 'EPSG:4326', 'EPSG:3857'],
    resolution: {
      nativeResolutionMeters: null,
      pixelSize: 'Variable por escala',
      scale: 'MTN25/MTN50',
      suitableForMicrocell: false,
      notes: 'Cartografía topográfica oficial',
    },
    temporal: {
      hasTimeDimension: false,
      timeRange: null,
      acquisitionDate: null,
      notes: 'Actualización periódica',
    },
    styles: ['default'],
    transparency: 1.0,
    license: {
      attribution: '© Instituto Geográfico Nacional de España',
      licenseType: 'CC BY 4.0',
      commercialUse: true,
      restrictions: ['Atribución requerida'],
      url: 'https://www.ign.es/web/ign/portal/portal-licencias',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Cartografía topográfica' },
    verificationStatus: 'METADATA_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'IGN WMS Inspire',
    getFeatureInfo: true,
    evidenceType: 'Cartografía topográfica',
    enabled: false,
    visible: false,
    order: 11,
    favorite: false,
  },

  // === GEOLOGÍA IGME ===
  {
    id: 'igme-geode',
    officialName: 'GEODE',
    descriptiveName: 'Cartografía Geológica MAGNA 50',
    provider: 'IGME',
    providerUrl: 'https://mapas.igme.es/',
    serviceUrl: 'https://mapas.igme.es/gis/services/Cartografia_GEODE/MapServer/WMSServer',
    layerType: 'WMS',
    layerId: '0',
    category: 'GEOLOGY',
    geographicCoverage: 'España',
    supportedScales: ['1:50000'],
    supportedCRS: ['EPSG:25829', 'EPSG:25830', 'EPSG:4326', 'EPSG:3857'],
    resolution: {
      nativeResolutionMeters: null,
      pixelSize: 'Escala 1:50.000',
      scale: '1:50000',
      suitableForMicrocell: false,
      notes: 'Contexto geológico regional, no métrico',
    },
    temporal: {
      hasTimeDimension: false,
      timeRange: null,
      acquisitionDate: null,
      notes: 'Cartografía geológica oficial',
    },
    styles: ['default'],
    transparency: 0.7,
    license: {
      attribution: '© Instituto Geológico y Minero de España',
      licenseType: 'IGME Terms',
      commercialUse: false,
      restrictions: ['Uso informativo', 'No comercial sin autorización'],
      url: 'https://www.igme.es/',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Contexto geológico' },
    verificationStatus: 'METADATA_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'IGME WMS',
    getFeatureInfo: true,
    evidenceType: 'Cartografía geológica',
    enabled: false,
    visible: false,
    order: 20,
    favorite: false,
  },

  // === SATELITAL EUMETSAT ===
  {
    id: 'eumetsat-msg-dust',
    officialName: 'msg_fes:rgb_dust',
    descriptiveName: 'MSG Dust RGB - Meteosat',
    provider: 'EUMETSAT',
    providerUrl: 'https://www.eumetsat.int/',
    serviceUrl: 'https://view.eumetsat.int/geoserver/wms',
    layerType: 'WMS',
    layerId: 'msg_fes:rgb_dust',
    category: 'SATELLITE',
    geographicCoverage: 'Europa/África (MSG 0°)',
    supportedScales: ['1:1000000', '1:50000000'],
    supportedCRS: ['EPSG:4326', 'CRS:84'],
    resolution: {
      nativeResolutionMeters: 3000,
      pixelSize: '~3 km',
      scale: 'Regional',
      suitableForMicrocell: false,
      notes: 'NO apto para detalles submétricos. Contexto ambiental.',
    },
    temporal: {
      hasTimeDimension: true,
      timeRange: { start: '2020-09-01', end: '2026-10-11', interval: 'PT15M' },
      acquisitionDate: null,
      notes: 'Actualización cada 15 minutos',
    },
    styles: ['default'],
    transparency: 0.6,
    license: {
      attribution: '© EUMETSAT',
      licenseType: 'EUMETSAT Data Policy',
      commercialUse: true,
      restrictions: ['Atribución requerida', 'Uso conforme a política EUMETSAT'],
      url: 'https://www.eumetsat.int/data-policy',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Contexto ambiental, no métrico' },
    verificationStatus: 'DATA_REQUEST_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'EUMETView WMS GetCapabilities',
    getFeatureInfo: false,
    evidenceType: 'Imagen satelital meteorológica',
    enabled: false,
    visible: false,
    order: 30,
    favorite: false,
  },
  {
    id: 'eumetsat-msg-vis006',
    officialName: 'msg_fes:vis006',
    descriptiveName: 'MSG Visible 0.6μm - SEVIRI',
    provider: 'EUMETSAT',
    providerUrl: 'https://www.eumetsat.int/',
    serviceUrl: 'https://view.eumetsat.int/geoserver/wms',
    layerType: 'WMS',
    layerId: 'msg_fes:vis006',
    category: 'SATELLITE',
    geographicCoverage: 'Europa/África (MSG 0°)',
    supportedScales: ['1:1000000', '1:50000000'],
    supportedCRS: ['EPSG:4326', 'CRS:84'],
    resolution: {
      nativeResolutionMeters: 1000,
      pixelSize: '~1 km',
      scale: 'Regional',
      suitableForMicrocell: false,
      notes: 'NO apto para detalles métricos',
    },
    temporal: {
      hasTimeDimension: true,
      timeRange: { start: '2020-08-01', end: '2026-10-11', interval: 'PT15M' },
      acquisitionDate: null,
      notes: 'Canal visible diurno',
    },
    styles: ['default'],
    transparency: 0.6,
    license: {
      attribution: '© EUMETSAT',
      licenseType: 'EUMETSAT Data Policy',
      commercialUse: true,
      restrictions: ['Atribución requerida'],
      url: 'https://www.eumetsat.int/data-policy',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Contexto ambiental' },
    verificationStatus: 'DATA_REQUEST_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'EUMETView WMS GetCapabilities',
    getFeatureInfo: false,
    evidenceType: 'Imagen satelital visible',
    enabled: false,
    visible: false,
    order: 31,
    favorite: false,
  },
  {
    id: 'eumetsat-msg-fire',
    officialName: 'msg_fes:fire',
    descriptiveName: 'MSG Active Fire Monitoring',
    provider: 'EUMETSAT',
    providerUrl: 'https://www.eumetsat.int/',
    serviceUrl: 'https://view.eumetsat.int/geoserver/wms',
    layerType: 'WMS',
    layerId: 'msg_fes:fire',
    category: 'FIRES',
    geographicCoverage: 'Europa/África (MSG 0°)',
    supportedScales: ['1:1000000', '1:50000000'],
    supportedCRS: ['EPSG:4326', 'CRS:84'],
    resolution: {
      nativeResolutionMeters: 3000,
      pixelSize: '~3 km',
      scale: 'Regional',
      suitableForMicrocell: false,
      notes: 'Detección de incendios activos, no métrico',
    },
    temporal: {
      hasTimeDimension: true,
      timeRange: { start: '2020-09-01', end: '2026-10-11', interval: 'PT15M' },
      acquisitionDate: null,
      notes: 'Detección de incendios activos',
    },
    styles: ['default'],
    transparency: 0.7,
    license: {
      attribution: '© EUMETSAT',
      licenseType: 'EUMETSAT Data Policy',
      commercialUse: true,
      restrictions: ['Atribución requerida'],
      url: 'https://www.eumetsat.int/data-policy',
    },
    requiresAuth: false,
    compatibility: { leaflet: true, cesium: true, microview: false, notes: 'Detección de incendios' },
    verificationStatus: 'DATA_REQUEST_VERIFIED',
    lastVerified: '2026-01-15',
    provenance: 'EUMETView WMS GetCapabilities',
    getFeatureInfo: false,
    evidenceType: 'Detección de incendios',
    enabled: false,
    visible: false,
    order: 32,
    favorite: false,
  },
];

/**
 * Perfiles predefinidos de capas para investigación.
 */
export const LAYER_PROFILES = {
  MINING_RESEARCH: {
    name: 'Investigación Minera',
    description: 'Capas para investigación de indicios mineros',
    layerIds: ['ign-pnoa-orthophoto', 'igme-geode', 'ign-mapa-raster'],
  },
  MICRORELIEF: {
    name: 'Microrelieve',
    description: 'Capas para análisis de microtopografía',
    layerIds: ['ign-pnoa-orthophoto', 'esri-world-imagery'],
  },
  LIDAR_MDT: {
    name: 'LiDAR y MDT',
    description: 'Capas LiDAR y modelos digitales',
    layerIds: ['ign-pnoa-orthophoto'],
  },
  HISTORICAL: {
    name: 'Cartografía Histórica',
    description: 'Ortofotos y mapas históricos',
    layerIds: ['ign-pnoa-orthophoto'],
  },
  HYDROLOGY: {
    name: 'Hidrología',
    description: 'Capas hidrográficas',
    layerIds: ['ign-mapa-raster'],
  },
  VEGETATION: {
    name: 'Vegetación',
    description: 'Capas de vegetación y usos del suelo',
    layerIds: ['ign-pnoa-orthophoto'],
  },
  FIRES: {
    name: 'Incendios',
    description: 'Detección y seguimiento de incendios',
    layerIds: ['eumetsat-msg-fire'],
  },
  SATELLITE_COMPARISON: {
    name: 'Comparación Satelital',
    description: 'Imágenes satelitales para comparación temporal',
    layerIds: ['eumetsat-msg-vis006', 'eumetsat-msg-dust'],
  },
};
