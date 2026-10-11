import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MISSION_AREA } from '../data/missionData';

interface Props {
  activeLayers: {
    anomalies: boolean;
    coverageGaps: boolean;
    missionArea: boolean;
    igmeIndicios: boolean;
  };
}
type GroupKey = keyof Props['activeLayers'];

export default function MapView({ activeLayers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupsRef = useRef<Record<GroupKey, L.LayerGroup> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: MISSION_AREA.center, zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const groups: Record<GroupKey,L.LayerGroup> = {
      missionArea:L.layerGroup(),
      anomalies:L.layerGroup(),
      coverageGaps:L.layerGroup(),
      igmeIndicios:L.layerGroup(),
    };

    // La envolvente se calcula SOLO a partir de la cabecera LAZ; no define una finca.
    const coords = MISSION_AREA.verifiedLasEnvelope.map(([lon, lat]) => [lat, lon] as [number,number]);
    L.polygon(coords, { color:'#60a5fa', fillOpacity:0.08, weight:2, dashArray:'6,4' })
      .bindPopup('<b>Envolvente de CABECERA LAZ 2024 AND 757-4211</b><p>EPSG:25829, transformada para visualización. Cobertura individual de puntos NO comprobada. No equivale al cortijo.</p>')
      .addTo(groups.missionArea);

    L.circleMarker(MISSION_AREA.center, {
      radius:7, color:'#fbbf24', fillColor:'#f59e0b', fillOpacity:0.8, weight:2,
    }).bindPopup('<b>Referencia provisional del arroyo Matarrama</b><p>38.01250, -6.06628. NO es la posición verificada del Cortijo de Daniela.</p>')
      .addTo(map);

    const envBounds = L.latLngBounds(coords);
    envBounds.extend(MISSION_AREA.center);
    map.fitBounds(envBounds.pad(0.2), { maxZoom: 15 });
    mapRef.current = map;
    groupsRef.current = groups;
    setReady(true);
    return () => {
      map.remove();
      mapRef.current=null;
      groupsRef.current=null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !groupsRef.current) return;
    const map=mapRef.current, groups=groupsRef.current;
    (Object.keys(groups) as GroupKey[]).forEach((key) => {
      if (activeLayers[key]) {
        if (!map.hasLayer(groups[key])) groups[key].addTo(map);
      } else if (map.hasLayer(groups[key])) map.removeLayer(groups[key]);
    });
  }, [activeLayers, ready]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg border border-gray-700">
      <div ref={containerRef} className="h-full w-full" style={{ minHeight:500 }}/>
      <div className="absolute right-3 top-3 z-[1000] max-w-[250px] rounded-lg border border-gray-700 bg-gray-900/95 p-3 text-xs">
        <strong className="text-blue-300">Lectura científica del mapa</strong>
        <p className="mt-1">Azul: envolvente del LAZ comprobado por cabecera.</p>
        <p className="mt-1">Amarillo: punto provisional del arroyo; no es el cortijo.</p>
        <p className="mt-1 text-amber-300">Anomalías, huecos e indicios IGME: sin geometrías verificadas que mostrar.</p>
      </div>
      <div className="absolute bottom-3 left-3 z-[1000] rounded border border-gray-700 bg-gray-900/95 px-2 py-1 text-xs text-gray-300">
        Mapa OSM (EPSG:3857). LAZ fuente: ETRS89 / UTM 29N (EPSG:25829).
      </div>
    </div>
  );
}
