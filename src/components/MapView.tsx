import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { missionData, MISSION_AREA } from '../data/missionData';

interface MapViewProps {
  activeLayers: {
    anomalies: boolean;
    coverageGaps: boolean;
    missionArea: boolean;
    igmeIndicios: boolean;
  };
}

export default function MapView({ activeLayers }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MISSION_AREA.center,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Mission area bounds
    const boundsRect = L.rectangle(
      [
        [MISSION_AREA.bounds.sw[0], MISSION_AREA.bounds.sw[1]],
        [MISSION_AREA.bounds.ne[0], MISSION_AREA.bounds.ne[1]],
      ],
      { color: '#3b82f6', weight: 2, fillOpacity: 0.05, dashArray: '5,5' }
    );
    boundsRect.bindPopup('<b>Área de trabajo MINERAL-01</b><br/>Cortijo de Daniela, Arroyo de Matarrama<br/>TM Montemolín (Badajoz)');
    boundsRect.addTo(map);

    // Anomalies
    missionData.anomalies.forEach((anomaly) => {
      if (anomaly.geometry.type === 'Polygon') {
        const coords = (anomaly.geometry as GeoJSON.Polygon).coordinates[0].map(
          (c) => [c[1], c[0]] as [number, number]
        );
        const color = anomaly.evidenceLevel === 'TOPOGRAPHIC_OBS' ? '#f59e0b' :
                     anomaly.evidenceLevel === 'HUMAN_ACTIVITY_HYPOTHESIS' ? '#ef4444' : '#8b5cf6';
        const polygon = L.polygon(coords, {
          color,
          weight: 2,
          fillOpacity: 0.2,
        });
        polygon.bindPopup(`
          <div style="min-width:200px">
            <b>${anomaly.id}</b><br/>
            <span style="color:${color}">● ${anomaly.evidenceLevel.replace(/_/g, ' ')}</span><br/>
            <b>Dimensiones:</b> ${anomaly.dimensions.length}m × ${anomaly.dimensions.width}m × ${anomaly.dimensions.depth}m<br/>
            <b>Elevación:</b> ${anomaly.elevation}m<br/>
            <b>Metodología:</b> ${anomaly.methodology}<br/>
            <b>Confianza:</b> ${(anomaly.confidence * 100).toFixed(0)}%<br/>
            <b>IGME:</b> ${anomaly.igmeRecord}<br/>
            <b>Confirmada:</b> ${anomaly.confirmed ? 'SÍ' : 'NO — requiere revisión humana'}<br/>
            <hr/><i>${anomaly.alternativeInterpretations.join('; ')}</i>
          </div>
        `);
        polygon.addTo(map);
      }
    });

    // Coverage gaps
    missionData.coverageGaps.forEach((gap) => {
      const coords = (gap.geometry as GeoJSON.Polygon).coordinates[0].map(
        (c) => [c[1], c[0]] as [number, number]
      );
      const gapRect = L.polygon(coords, {
        color: '#6b7280',
        weight: 1,
        fillOpacity: 0.15,
        dashArray: '3,3',
      });
      gapRect.bindPopup(`<b>HUECO: ${gap.id}</b><br/>${gap.reason}<br/>Severidad: ${gap.severity}`);
      gapRect.addTo(map);
    });

    // Center marker
    L.marker(MISSION_AREA.center)
      .bindPopup('<b>Punto de referencia</b><br/>Área de investigación MINERAL-01')
      .addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    // Layer visibility could be controlled here
  }, [activeLayers, mapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-700">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute top-3 right-3 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1 border border-gray-700">
        <div className="font-bold text-blue-400 mb-2">Capas activas</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500 inline-block"></span>
          <span>Área de trabajo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500 inline-block"></span>
          <span>Anomalías topográficas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500 inline-block"></span>
          <span>Hipótesis actividad humana</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-gray-500/30 border border-gray-500 inline-block border-dashed"></span>
          <span>Huecos de cobertura</span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-400 border border-gray-700">
        CRS: ETRS89 / UTM 30N (EPSG:25830) | Tile: OSM
      </div>
    </div>
  );
}
