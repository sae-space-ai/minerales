/**
 * Transformaciones de coordenadas UTM ↔ WGS84
 * 
 * Implementación basada en las fórmulas de Snyder (USGS Professional Paper 1395)
 * con el elipsoide GRS80 (equivalente a WGS84 para precisiones submétricas).
 * 
 * Soporta husos UTM 29N (EPSG:25829) y 30N (EPSG:25830).
 * 
 * Tolerancia comprobada: < 1 m en la Península Ibérica.
 */

// Parámetros del elipsoide GRS80 / WGS84
const GRS80 = {
  a: 6378137.0,           // semieje mayor (m)
  f: 1 / 298.257222101,   // achatamiento
};

const k0 = 0.9996; // factor de escala central UTM

function getUtmZoneParams(epsg: number): { lon0: number; falseEast: number; falseNorth: number } {
  if (epsg === 25829) {
    return { lon0: -9 * (Math.PI / 180), falseEast: 500000, falseNorth: 0 };
  }
  if (epsg === 25830) {
    return { lon0: -3 * (Math.PI / 180), falseEast: 500000, falseNorth: 0 };
  }
  throw new Error(`EPSG no soportado: ${epsg}. Solo 25829 y 25830.`);
}

/**
 * Convierte coordenadas UTM (este, norte) a geográficas (lat, lon) en grados.
 */
export function utmToWgs84(
  easting: number,
  northing: number,
  epsg: 25829 | 25830
): { lat: number; lon: number } {
  const { lon0, falseEast, falseNorth } = getUtmZoneParams(epsg);
  const { a, f } = GRS80;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);

  const x = easting - falseEast;
  const y = northing - falseNorth;

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
  const T1 = tanPhi1 * tanPhi1;
  const C1 = e_prime2 * cosPhi1 * cosPhi1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
  const D = x / (N1 * k0);

  const lat =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e_prime2) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e_prime2 - 3 * C1 * C1) * Math.pow(D, 6)) / 720);

  const lon =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e_prime2 + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
      cosPhi1;

  return {
    lat: lat * (180 / Math.PI),
    lon: lon * (180 / Math.PI),
  };
}

/**
 * Convierte coordenadas geográficas (lat, lon) en grados a UTM (este, norte).
 */
export function wgs84ToUtm(
  lat: number,
  lon: number,
  epsg: 25829 | 25830
): { easting: number; northing: number } {
  const { lon0, falseEast, falseNorth } = getUtmZoneParams(epsg);
  const { a, f } = GRS80;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);

  const phi = lat * (Math.PI / 180);
  const lambda = lon * (Math.PI / 180);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const tanPhi = Math.tan(phi);

  const N = a / Math.sqrt(1 - e2 * sinPhi * sinPhi);
  const T = tanPhi * tanPhi;
  const C = e_prime2 * cosPhi * cosPhi;
  const A = cosPhi * (lambda - lon0);

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi));

  const easting =
    falseEast +
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * e_prime2) * Math.pow(A, 5)) / 120);

  const northing =
    falseNorth +
    k0 *
      (M +
        N *
          tanPhi *
          ((A * A) / 2 +
            ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * e_prime2) * Math.pow(A, 6)) / 720));

  return { easting, northing };
}

/**
 * Transforma un bounding box UTM a WGS84.
 */
export function boundsUtmToWgs84(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  epsg: 25829 | 25830
): { sw: [number, number]; ne: [number, number] } {
  const sw = utmToWgs84(minX, minY, epsg);
  const ne = utmToWgs84(maxX, maxY, epsg);
  return {
    sw: [sw.lat, sw.lon],
    ne: [ne.lat, ne.lon],
  };
}

/**
 * Transforma un array de coordenadas UTM a WGS84.
 */
export function pointsUtmToWgs84(
  points: Array<[number, number]>,
  epsg: 25829 | 25830
): Array<[number, number]> {
  return points.map(([x, y]) => {
    const { lat, lon } = utmToWgs84(x, y, epsg);
    return [lon, lat]; // GeoJSON: [lon, lat]
  });
}

/**
 * Calcula la distancia entre dos puntos WGS84 (fórmula de Haversine).
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Prueba de ida y vuelta de coordenadas.
 * Devuelve el error en metros.
 */
export function roundTripError(
  easting: number,
  northing: number,
  epsg: 25829 | 25830
): number {
  const { lat, lon } = utmToWgs84(easting, northing, epsg);
  const back = wgs84ToUtm(lat, lon, epsg);
  const dx = back.easting - easting;
  const dy = back.northing - northing;
  return Math.sqrt(dx * dx + dy * dy);
}
