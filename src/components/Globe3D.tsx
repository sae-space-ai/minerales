/**
 * MINERAL EARTH 3D — Visor planetario con CesiumJS.
 * 
 * Carga diferida (lazy) para no afectar el bundle inicial.
 * Mantiene Leaflet intacto como visor 2D independiente.
 */

import { useEffect, useRef, useState } from 'react';
import { configureCesium, BASE_IMAGERY_PROVIDERS, WMS_SERVICES, PILOT_AREA } from '../lib/cesiumConfig';
import { useMission } from '../lib/store';
import { boundsUtmToWgs84 } from '../lib/coordinates';

// Configurar Cesium antes de cualquier uso
configureCesium();

// Referencia al módulo Cesium cargado dinámicamente
let CesiumModule: any = null;

interface Globe3DProps {
  onReady?: () => void;
}

export default function Globe3D({ onReady }: Globe3DProps) {
  const { state } = useMission();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    baseImagery: 'ESRI_WORLD_IMAGERY',
    eumetsat: false,
    ignPnoa: false,
    ignBase: false,
    igmeGeology: false,
    anomalies: true,
    missionArea: true,
    terrain: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraInfo, setCameraInfo] = useState({
    lat: PILOT_AREA.center.lat,
    lon: PILOT_AREA.center.lon,
    height: PILOT_AREA.center.height,
  });

  useEffect(() => {
    let viewer: any = null;
    let isMounted = true;

    async function initCesium() {
      try {
        // Importación dinámica de CesiumJS
        const Cesium = await import('cesium');
        CesiumModule = Cesium;
        
        if (!isMounted || !containerRef.current) return;

        // Crear viewer (sin token, usando fuentes abiertas)
        viewer = new Cesium.Viewer(containerRef.current, {
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
          shouldAnimate: true,
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        });

        // Configurar escena
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.fog.enabled = true;

        // Añadir capa base
        const baseProvider = BASE_IMAGERY_PROVIDERS.ESRI_WORLD_IMAGERY;
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: baseProvider.url,
          credit: new Cesium.Credit(baseProvider.credit),
          maximumLevel: baseProvider.maxZoom,
        });
        viewer.imageryLayers.addImageryProvider(imageryProvider);

        // Volar al área piloto
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            PILOT_AREA.center.lon,
            PILOT_AREA.center.lat,
            PILOT_AREA.center.height
          ),
          duration: 2,
        });

        // Actualizar información de cámara
        viewer.camera.changed.addEventListener(() => {
          if (!isMounted) return;
          const position = viewer.camera.positionCartographic;
          setCameraInfo({
            lat: Cesium.Math.toDegrees(position.latitude),
            lon: Cesium.Math.toDegrees(position.longitude),
            height: position.height,
          });
        });

        viewerRef.current = viewer;
        setIsLoading(false);
        onReady?.();
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error inicializando CesiumJS');
          setIsLoading(false);
        }
      }
    }

    initCesium();

    return () => {
      isMounted = false;
      if (viewer) {
        viewer.destroy();
        viewerRef.current = null;
      }
    };
  }, [onReady]);

  // Añadir/quitar capas dinámicamente
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !CesiumModule) return;

    const Cesium = CesiumModule;

    // EUMETSAT
    const eumetsatLayer = viewer.imageryLayers.get(1);
    if (activeLayers.eumetsat && !eumetsatLayer) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.EUMETVIEW.url,
        layers: 'MSG_Dust_RGB',
        parameters: { transparent: true, format: 'image/png' },
      });
      viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.eumetsat && eumetsatLayer) {
      viewer.imageryLayers.remove(eumetsatLayer);
    }

    // IGN PNOA
    const pnoaLayer = viewer.imageryLayers.get(2);
    if (activeLayers.ignPnoa && !pnoaLayer) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.IGN_PNOA.url,
        layers: 'OI.OrthoimageCoverage',
        parameters: { transparent: true, format: 'image/png' },
      });
      viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.ignPnoa && pnoaLayer) {
      viewer.imageryLayers.remove(pnoaLayer);
    }

    // IGME Geología
    const igmeLayer = viewer.imageryLayers.get(3);
    if (activeLayers.igmeGeology && !igmeLayer) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.IGME_GEOLOGIA.url,
        layers: '0',
        parameters: { transparent: true, format: 'image/png' },
      });
      viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.igmeGeology && igmeLayer) {
      viewer.imageryLayers.remove(igmeLayer);
    }
  }, [activeLayers]);

  const flyTo = (lat: number, lon: number, height: number = 10000) => {
    const viewer = viewerRef.current;
    if (!viewer || !CesiumModule) return;
    viewer.camera.flyTo({
      destination: CesiumModule.Cartesian3.fromDegrees(lon, lat, height),
      duration: 2,
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Parsear coordenadas o nombre
    const coordMatch = searchQuery.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      flyTo(lat, lon, 5000);
    } else {
      // Búsqueda por nombre (usar geocoder de Cesium)
      const viewer = viewerRef.current;
      if (viewer && viewer.geocoder) {
        viewer.geocoder.viewModel.search(searchQuery);
      }
    }
  };

  const resetView = () => {
    flyTo(PILOT_AREA.center.lat, PILOT_AREA.center.lon, PILOT_AREA.center.height);
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-400">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Error cargando MINERAL EARTH 3D</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Verifique que WebGL está habilitado en su navegador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Contenedor Cesium */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Cargando MINERAL EARTH 3D</h3>
            <p className="text-sm text-gray-400">Inicializando motor CesiumJS...</p>
          </div>
        </div>
      )}

      {/* Panel de control de capas */}
      <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 text-xs space-y-2 border border-gray-700 max-w-xs z-10">
        <h3 className="font-bold text-white text-sm mb-2">Capas</h3>
        
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.eumetsat}
              onChange={() => toggleLayer('eumetsat')}
              className="rounded"
            />
            <span className="text-gray-300">EUMETSAT (MSG)</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.ignPnoa}
              onChange={() => toggleLayer('ignPnoa')}
              className="rounded"
            />
            <span className="text-gray-300">IGN PNOA Ortofoto</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.igmeGeology}
              onChange={() => toggleLayer('igmeGeology')}
              className="rounded"
            />
            <span className="text-gray-300">IGME Geología</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeLayers.terrain}
              onChange={() => toggleLayer('terrain')}
              className="rounded"
            />
            <span className="text-gray-300">Relieve 3D</span>
          </label>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <h4 className="font-semibold text-gray-400 mb-1">Cámara</h4>
          <div className="text-gray-500 font-mono text-[10px]">
            <div>Lat: {cameraInfo.lat.toFixed(5)}°</div>
            <div>Lon: {cameraInfo.lon.toFixed(5)}°</div>
            <div>Alt: {(cameraInfo.height / 1000).toFixed(2)} km</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar coordenadas (lat, lon) o nombre..."
          className="flex-1 px-4 py-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/50 rounded-lg text-sm text-blue-200 transition-colors"
        >
          Buscar
        </button>
        <button
          onClick={resetView}
          className="px-4 py-2 bg-gray-700/40 hover:bg-gray-700/60 border border-gray-600/50 rounded-lg text-sm text-gray-200 transition-colors"
        >
          🏠 Inicio
        </button>
      </div>

      {/* Información del territorio piloto */}
      <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 text-xs border border-gray-700 max-w-sm z-10">
        <h3 className="font-bold text-white mb-1">MINERAL-01 / DANIELA-MATARRAMA</h3>
        <p className="text-gray-400 text-[10px]">
          {PILOT_AREA.name}
        </p>
        <p className="text-gray-500 text-[10px] mt-1 italic">
          {PILOT_AREA.note}
        </p>
      </div>
    </div>
  );
}
