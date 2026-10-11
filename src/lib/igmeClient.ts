/**
 * Cliente IGME para consulta del inventario de indicios minerales.
 * 
 * Endpoint: https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query
 * 
 * Limitación: CORS bloquea la consulta directa desde el navegador.
 * Se requiere un proxy del lado servidor o una extensión CORS del navegador.
 * 
 * Este módulo:
 * 1. Intenta la consulta directa.
 * 2. Si falla por CORS, registra QUERY_FAILED honestamente.
 * 3. Nunca devuelve 0 indicios cuando la consulta falla.
 * 4. Registra URL exacta, timestamp, CRS y estado HTTP.
 */

import { QueryStatus, IGMEFeature, DataClassification } from './store';

export interface IGMEQueryParams {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  inSR: number; // EPSG code
  outSR?: number;
  outFields?: string;
}

export interface IGMEQueryResult {
  status: QueryStatus;
  timestamp: string;
  url: string;
  crs: string;
  httpStatus: number | null;
  totalFeatures: number | null;
  features: IGMEFeature[];
  errorMessage: string | null;
  dataClassification: DataClassification;
}

const IGME_ENDPOINT = 'https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query';

/**
 * Construye la URL de consulta IGME.
 */
export function buildIGMEQueryURL(params: IGMEQueryParams): string {
  const geometry = JSON.stringify({
    xmin: params.xmin,
    ymin: params.ymin,
    xmax: params.xmax,
    ymax: params.ymax,
    spatialReference: { wkid: params.inSR },
  });

  const searchParams = new URLSearchParams({
    geometry,
    geometryType: 'esriGeometryEnvelope',
    inSR: String(params.inSR),
    spatialRel: 'esriSpatialRelIntersects',
    outFields: params.outFields || '*',
    f: 'json',
  });

  if (params.outSR) {
    searchParams.set('outSR', String(params.outSR));
  }

  return `${IGME_ENDPOINT}?${searchParams.toString()}`;
}

/**
 * Ejecuta la consulta IGME.
 * 
 * Devuelve QUERY_FAILED si CORS bloquea la petición.
 * Nunca devuelve totalFeatures = 0 cuando la consulta falla.
 */
export async function queryIGME(params: IGMEQueryParams): Promise<IGMEQueryResult> {
  const url = buildIGMEQueryURL(params);
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        status: 'QUERY_FAILED',
        timestamp,
        url,
        crs: `EPSG:${params.inSR}`,
        httpStatus: response.status,
        totalFeatures: null,
        features: [],
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
        dataClassification: 'FAILED',
      };
    }

    const data = await response.json();

    // Verificar estructura de respuesta
    if (data.error) {
      return {
        status: 'QUERY_FAILED',
        timestamp,
        url,
        crs: `EPSG:${params.inSR}`,
        httpStatus: 200,
        totalFeatures: null,
        features: [],
        errorMessage: `Error IGME: ${data.error.message || JSON.stringify(data.error)}`,
        dataClassification: 'FAILED',
      };
    }

    const features: IGMEFeature[] = (data.features || []).map((f: any, idx: number) => ({
      id: f.attributes?.OBJECTID?.toString() || `igme-${idx}`,
      name: f.attributes?.NOMBRE || f.attributes?.NAME || 'Sin nombre',
      type: f.attributes?.TIPO || f.attributes?.TYPE || 'Desconocido',
      coordinates: f.geometry
        ? [f.geometry.x || 0, f.geometry.y || 0]
        : [0, 0],
      mineral: f.attributes?.MINERAL || null,
      status: f.attributes?.ESTADO || null,
      source: 'IGME BDMIN Indicios',
      dataClassification: 'OFFICIAL' as DataClassification,
    }));

    const totalFeatures = data.features?.length ?? null;

    return {
      status: totalFeatures === 0 ? 'QUERY_EMPTY' : 'QUERY_SUCCESS',
      timestamp,
      url,
      crs: `EPSG:${params.outSR || params.inSR}`,
      httpStatus: 200,
      totalFeatures,
      features,
      errorMessage: null,
      dataClassification: 'OFFICIAL',
    };
  } catch (error) {
    // CORS u otro error de red
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      status: 'QUERY_FAILED',
      timestamp,
      url,
      crs: `EPSG:${params.inSR}`,
      httpStatus: null,
      totalFeatures: null,
      features: [],
      errorMessage: `CORS o error de red: ${errorMessage}. Se requiere proxy del lado servidor.`,
      dataClassification: 'FAILED',
    };
  }
}

/**
 * Intenta consultar a través de un proxy CORS público (allorigins).
 * Esto NO debe usarse en producción. Solo para desarrollo/demostración.
 */
export async function queryIGMEViaProxy(params: IGMEQueryParams): Promise<IGMEQueryResult> {
  const url = buildIGMEQueryURL(params);
  const proxyURL = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(proxyURL);

    if (!response.ok) {
      return {
        status: 'QUERY_FAILED',
        timestamp,
        url,
        crs: `EPSG:${params.inSR}`,
        httpStatus: response.status,
        totalFeatures: null,
        features: [],
        errorMessage: `Proxy HTTP ${response.status}`,
        dataClassification: 'FAILED',
      };
    }

    const data = await response.json();
    const features: IGMEFeature[] = (data.features || []).map((f: any, idx: number) => ({
      id: f.attributes?.OBJECTID?.toString() || `igme-${idx}`,
      name: f.attributes?.NOMBRE || 'Sin nombre',
      type: f.attributes?.TIPO || 'Desconocido',
      coordinates: f.geometry ? [f.geometry.x || 0, f.geometry.y || 0] : [0, 0],
      mineral: f.attributes?.MINERAL || null,
      status: f.attributes?.ESTADO || null,
      source: 'IGME BDMIN Indicios (vía proxy)',
      dataClassification: 'OFFICIAL' as DataClassification,
    }));

    return {
      status: features.length === 0 ? 'QUERY_EMPTY' : 'QUERY_SUCCESS',
      timestamp,
      url,
      crs: `EPSG:${params.outSR || params.inSR}`,
      httpStatus: 200,
      totalFeatures: features.length,
      features,
      errorMessage: null,
      dataClassification: 'OFFICIAL',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      status: 'QUERY_FAILED',
      timestamp,
      url,
      crs: `EPSG:${params.inSR}`,
      httpStatus: null,
      totalFeatures: null,
      features: [],
      errorMessage: `Proxy falló: ${errorMessage}`,
      dataClassification: 'FAILED',
    };
  }
}
