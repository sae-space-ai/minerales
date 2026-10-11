/**
 * Configuración de CesiumJS para MINERAL EARTH 3D.
 * 
 * Usa CDN público para assets (evita modificar vite.config.js).
 * No requiere Cesium ion token para funcionalidad básica.
 */

// Configurar CESIUM_BASE_URL antes de importar Cesium
export function configureCesium(): void {
  if (typeof window !== 'undefined') {
    // Usar CDN público de CesiumJS para assets
    (window as any).CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.119/Build/Cesium/';
  }
}

/**
 * Proveedores de imágenes base disponibles sin token.
 */
export const BASE_IMAGERY_PROVIDERS = {
  OSM: {
    name: 'OpenStreetMap',
    type: 'UrlTemplateImageryProvider',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: '© OpenStreetMap contributors',
    maxZoom: 19,
    available: true,
  },
  ESRI_WORLD_IMAGERY: {
    name: 'Esri World Imagery',
    type: 'UrlTemplateImageryProvider',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: 'Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    available: true,
  },
  ESRI_WORLD_TOPO: {
    name: 'Esri World Topo',
    type: 'UrlTemplateImageryProvider',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    credit: 'Esri',
    maxZoom: 19,
    available: true,
  },
  CARTODB_VOYAGER: {
    name: 'CARTO Voyager',
    type: 'UrlTemplateImageryProvider',
    url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    credit: '© CARTO © OpenStreetMap',
    maxZoom: 18,
    available: true,
  },
};

/**
 * Servicios WMS/WMTS oficiales disponibles.
 */
export const WMS_SERVICES = {
  EUMETVIEW: {
    name: 'EUMETView',
    url: 'https://view.eumetsat.int/geoservices/ows',
    type: 'WMS',
    available: true,
    authRequired: false,
    layers: [
      { id: 'MSG_Dust_RGB', name: 'MSG Dust RGB', description: 'Imágenes MSG en falso color para polvo' },
      { id: 'MSG_IR108', name: 'MSG IR 10.8μm', description: 'Infrarrojo térmico' },
      { id: 'MSG_VIS006', name: 'MSG Visible 0.6μm', description: 'Visible de alta resolución' },
    ],
  },
  IGN_PNOA: {
    name: 'IGN PNOA',
    url: 'https://www.ign.es/wms-inspire/pnoa-ma',
    type: 'WMS',
    available: true,
    authRequired: false,
    layers: [
      { id: 'OI.OrthoimageCoverage', name: 'Ortofoto PNOA', description: 'Ortofoto oficial de España' },
    ],
  },
  IGN_BASE: {
    name: 'IGN Base',
    url: 'https://www.ign.es/wms-inspire/mapa-raster',
    type: 'WMS',
    available: true,
    authRequired: false,
    layers: [
      { id: 'mtn_raster', name: 'Mapa Raster IGN', description: 'Mapa topográfico oficial' },
    ],
  },
  IGME_GEOLOGIA: {
    name: 'IGME Geología',
    url: 'https://mapas.igme.es/gis/services/Cartografia_GEODE/MapServer/WMSServer',
    type: 'WMS',
    available: true,
    authRequired: false,
    layers: [
      { id: '0', name: 'Geología MAGNA 50', description: 'Cartografía geológica 1:50.000' },
    ],
  },
};

/**
 * Proveedores de terreno disponibles.
 */
export const TERRAIN_PROVIDERS = {
  ELLIPSOID: {
    name: 'Elipsoide (sin relieve)',
    type: 'EllipsoidTerrainProvider',
    available: true,
    authRequired: false,
  },
  // Cesium World Terrain requiere token de Cesium ion
  CESIUM_WORLD: {
    name: 'Cesium World Terrain',
    type: 'CesiumTerrainProvider',
    available: false,
    authRequired: true,
    note: 'Requiere token de Cesium ion (gratuito)',
  },
  // MDT local desde archivo cargado por el usuario
  LOCAL_MDT: {
    name: 'MDT local (usuario)',
    type: 'CustomTerrainProvider',
    available: true,
    authRequired: false,
    note: 'Requiere MDT cargado desde GeoTIFF',
  },
};

/**
 * Coordenadas de referencia para el territorio piloto.
 */
export const PILOT_AREA = {
  name: 'Cortijo de Daniela / Arroyo de Matarrama / Montemolín',
  // Centro aproximado del área de estudio (referencia provisional)
  center: {
    lat: 38.02,
    lon: -6.07,
    height: 50000, // vista inicial a 50km
  },
  // Bounds del archivo LAZ real (EPSG:25829 transformado a WGS84)
  bounds: {
    west: -6.197,
    south: 38.030,
    east: -6.185,
    north: 38.037,
  },
  note: 'Coordenadas del área LAZ. La ubicación exacta del Cortijo de Daniela está UNVERIFIED.',
};

/**
 * Configuración inicial del viewer Cesium.
 */
export const VIEWER_OPTIONS = {
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  vrButton: false,
  geocoder: true,
  homeButton: true,
  infoBox: true,
  sceneModePicker: true,
  selectionIndicator: true,
  timeline: false,
  navigationHelpButton: true,
  creditContainer: 'cesium-credit-container',
  shouldAnimate: true,
};
