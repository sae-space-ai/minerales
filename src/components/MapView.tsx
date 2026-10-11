import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useMission } from '../lib/store';
import { boundsUtmToWgs84 } from '../lib/coordinates';

interface MapViewProps {
  activeLayers: {
    anomalies: boolean;
    coverageGaps: boolean;
    missionArea: boolean;
    igmeIndicios: boolean;
  };
}

export default function MapView({ activeLayers }: MapViewProps) {
  const { state } = useMission();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Refs para capas (permiten añadir/quitar sin recrear el mapa)
  const layersRef = useRef<{
    missionArea: L.Rectangle | null;
    anomalies: L.LayerGroup | null;
    coverageGaps: L.LayerGroup | null;
    igmeIndicios: L.LayerGroup | null;
    arroyoRef: L.Marker | null;
  }>({
    missionArea: null,
    anomalies: null,
    coverageGaps: null,
    igmeIndicios: null,
    arroyoRef: null,
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centro provisional basado en referencia del arroyo
    const center: L.LatLngExpression = [
      state.arroyoReference.coordinates[0],
      state.arroyoReference.coordinates[1],
    ];

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Capa de referencia del arroyo (siempre visible)
    const arroyoMarker = L.marker(
      [state.arroyoReference.coordinates[0], state.arroyoReference.coordinates[1]],
      { title: 'Arroyo de Matarrama (provisional)' }
    );
    arroyoMarker.bindPopup(
      `<div><b>Referencia provisional</b><br/>
      Arroyo de Matarrama<br/>
      <code>${state.arroyoReference.coordinates[0].toFixed(5)}, ${state.arroyoReference.coordinates[1].toFixed(5)}</code><br/>
      <em>${state.arroyoReference.note}</em></div>`
    );
    arroyoMarker.addTo(map);
    layersRef.current.arroyoRef = arroyoMarker;

    // Capa: Área de trabajo (bounds del LAZ si disponible, o bounds de referencia)
    let bounds: L.LatLngBoundsExpression;
    if (state.lasFile.bounds.xMin !== null) {
      const epsg = (state.lasFile.crsEPSG === 25830 ? 25830 : 25829) as 25829 | 25830;
      const wgsBounds = boundsUtmToWgs84(
        state.lasFile.bounds.xMin,
        state.lasFile.bounds.yMin!,
        state.lasFile.bounds.xMax!,
        state.lasFile.bounds.yMax!,
        epsg
      );
      bounds = [wgsBounds.sw, wgsBounds.ne];
    } else {
      // Bounds de referencia aproximados (757000-758000, 4210000-4210815 en EPSG:25829)
      const wgsBounds = boundsUtmToWgs84(757000, 4210000, 758000, 4210815, 25829);
      bounds = [wgsBounds.sw, wgsBounds.ne];
    }

    const missionRect = L.rectangle(bounds, {
      color: '#3b82f6',
      weight: 2,
      fillOpacity: 0.05,
      dashArray: '5,5',
    });
    missionRect.bindPopup(
      `<div><b>Área de trabajo MINERAL-01</b><br/>
      ${state.lasFile.filename ? `Archivo: ${state.lasFile.filename}` : 'Sin archivo cargado'}<br/>
      CRS original: ${state.lasFile.crsOriginal || 'EPSG:25829 (esperado)'}<br/>
      <em>Bounds transformados a WGS84 para visualización</em></div>`
    );
    missionRect.addTo(map);
    layersRef.current.missionArea = missionRect;

    // Capa: Anomalías
    const anomaliesGroup = L.layerGroup();
    state.anomalies.forEach((anomaly) => {
      if (anomaly.geometry.type === 'Polygon') {
        const coords = (anomaly.geometry as GeoJSON.Polygon).coordinates[0].map(
          (c) => [c[1], c[0]] as [number, number]
        );
        const isDemo = anomaly.dataClassification === 'DEMO_SYNTHETIC';
        const color = isDemo ? '#9ca3af' : '#f59e0b';
        const polygon = L.polygon(coords, {
          color,
          weight: 2,
          fillOpacity: isDemo ? 0.1 : 0.2,
          dashArray: isDemo ? '3,3' : undefined,
        });
        
        // Sanitizar popup (no innerHTML con datos externos)
        const popupContent = document.createElement('div');
        popupContent.className = 'text-xs';
        popupContent.innerHTML = `
          <b>${escapeHtml(anomaly.id)}</b><br/>
          <span class="${isDemo ? 'text-gray-400' : 'text-amber-400'}">
            ${isDemo ? '⚠️ DEMO SYNTHETIC' : anomaly.classification.replace(/_/g, ' ')}
          </span><br/>
          <b>Clasificación datos:</b> ${escapeHtml(anomaly.dataClassification)}<br/>
          ${anomaly.methodology ? `<b>Metodología:</b> ${escapeHtml(anomaly.methodology)}<br/>` : ''}
          ${anomaly.confidence !== null ? `<b>Confianza:</b> ${(anomaly.confidence * 100).toFixed(0)}%<br/>` : '<b>Confianza:</b> null (no calculada)<br/>'}
          <b>IGME:</b> ${escapeHtml(anomaly.igmeRecord)}<br/>
          <b>Confirmada:</b> ${anomaly.confirmed ? 'SÍ' : 'NO — requiere revisión humana'}<br/>
          <b>Revisión humana:</b> ${anomaly.humanReviewed ? 'Sí' : 'Pendiente'}<br/>
          <hr/>
          <em>${anomaly.alternativeInterpretations.map(escapeHtml).join('; ')}</em>
        `;
        polygon.bindPopup(popupContent);
        anomaliesGroup.addLayer(polygon);
      }
    });
    if (activeLayers.anomalies) anomaliesGroup.addTo(map);
    layersRef.current.anomalies = anomaliesGroup;

    // Capa: Huecos de cobertura
    const gapsGroup = L.layerGroup();
    // En modo REAL sin datos procesados, no hay huecos que mostrar
    if (state.mode === 'DEMO') {
      state.coverageGaps.forEach((gap) => {
        if (gap.geometry) {
          const coords = (gap.geometry as GeoJSON.Polygon).coordinates[0].map(
            (c) => [c[1], c[0]] as [number, number]
          );
          const gapPolygon = L.polygon(coords, {
            color: '#6b7280',
            weight: 1,
            fillOpacity: 0.15,
            dashArray: '3,3',
          });
          gapPolygon.bindPopup(
            `<div><b>HUECO: ${escapeHtml(gap.id)}</b><br/>${escapeHtml(gap.reason)}<br/>Severidad: ${gap.severity}<br/><em>${escapeHtml(gap.dataClassification)}</em></div>`
          );
          gapsGroup.addLayer(gapPolygon);
        } else {
          // Placeholder marker para gaps sin geometría
          const placeholder = L.circle(
            [state.arroyoReference.coordinates[0], state.arroyoReference.coordinates[1]],
            { radius: 500, color: '#6b7280', fillOpacity: 0.05, dashArray: '3,3' }
          );
          placeholder.bindPopup(
            `<div><b>${escapeHtml(gap.id)}</b><br/>${escapeHtml(gap.reason)}<br/><em>Dato: ${escapeHtml(gap.dataClassification)}</em></div>`
          );
          gapsGroup.addLayer(placeholder);
        }
      });
    }
    if (activeLayers.coverageGaps) gapsGroup.addTo(map);
    layersRef.current.coverageGaps = gapsGroup;

    // Capa: Indicios IGME
    const igmeGroup = L.layerGroup();
    state.igme.features.forEach((feature) => {
      const marker = L.circleMarker([feature.coordinates[1], feature.coordinates[0]], {
        radius: 6,
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.5,
      });
      marker.bindPopup(
        `<div><b>${escapeHtml(feature.name)}</b><br/>
        Tipo: ${escapeHtml(feature.type)}<br/>
        ${feature.mineral ? `Mineral: ${escapeHtml(feature.mineral)}<br/>` : ''}
        Fuente: ${escapeHtml(feature.source)}<br/>
        <em>Dato: ${escapeHtml(feature.dataClassification)}</em></div>`
      );
      igmeGroup.addLayer(marker);
    });
    if (activeLayers.igmeIndicios && state.igme.features.length > 0) igmeGroup.addTo(map);
    layersRef.current.igmeIndicios = igmeGroup;

    // Ajustar vista si hay bounds del LAZ
    if (state.lasFile.bounds.xMin !== null) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar visibilidad de capas cuando cambian los toggles
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Mission area
    if (layersRef.current.missionArea) {
      if (activeLayers.missionArea) {
        if (!map.hasLayer(layersRef.current.missionArea)) {
          layersRef.current.missionArea.addTo(map);
        }
      } else {
        if (map.hasLayer(layersRef.current.missionArea)) {
          map.removeLayer(layersRef.current.missionArea);
        }
      }
    }

    // Anomalies
    if (layersRef.current.anomalies) {
      if (activeLayers.anomalies) {
        if (!map.hasLayer(layersRef.current.anomalies)) {
          layersRef.current.anomalies.addTo(map);
        }
      } else {
        if (map.hasLayer(layersRef.current.anomalies)) {
          map.removeLayer(layersRef.current.anomalies);
        }
      }
    }

    // Coverage gaps
    if (layersRef.current.coverageGaps) {
      if (activeLayers.coverageGaps) {
        if (!map.hasLayer(layersRef.current.coverageGaps)) {
          layersRef.current.coverageGaps.addTo(map);
        }
      } else {
        if (map.hasLayer(layersRef.current.coverageGaps)) {
          map.removeLayer(layersRef.current.coverageGaps);
        }
      }
    }

    // IGME
    if (layersRef.current.igmeIndicios) {
      if (activeLayers.igmeIndicios) {
        if (!map.hasLayer(layersRef.current.igmeIndicios)) {
          layersRef.current.igmeIndicios.addTo(map);
        }
      } else {
        if (map.hasLayer(layersRef.current.igmeIndicios)) {
          map.removeLayer(layersRef.current.igmeIndicios);
        }
      }
    }
  }, [activeLayers, mapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-700">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute top-3 right-3 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1 border border-gray-700">
        <div className="font-bold text-blue-400 mb-2">Capas</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500 inline-block"></span>
          <span>Área de trabajo</span>
          <span className={`ml-auto ${activeLayers.missionArea ? 'text-green-400' : 'text-gray-600'}`}>
            {activeLayers.missionArea ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500 inline-block"></span>
          <span>Anomalías</span>
          <span className={`ml-auto ${activeLayers.anomalies ? 'text-green-400' : 'text-gray-600'}`}>
            {activeLayers.anomalies ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gray-500/30 border border-gray-500 inline-block border-dashed"></span>
          <span>Huecos</span>
          <span className={`ml-auto ${activeLayers.coverageGaps ? 'text-green-400' : 'text-gray-600'}`}>
            {activeLayers.coverageGaps ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500 inline-block"></span>
          <span>IGME</span>
          <span className={`ml-auto ${activeLayers.igmeIndicios ? 'text-green-400' : 'text-gray-600'}`}>
            {activeLayers.igmeIndicios ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-400 border border-gray-700 space-y-0.5">
        <div>Visualización: EPSG:3857 (Web Mercator — proyección Leaflet)</div>
        <div>Datos: {state.lasFile.crsOriginal || 'EPSG:25829'} → transformados a WGS84</div>
        <div>Modo: <span className={state.mode === 'REAL' ? 'text-green-400' : 'text-amber-400'}>{state.mode}</span></div>
      </div>
    </div>
  );
}

/**
 * Escapa HTML para prevenir XSS en popups.
 */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
