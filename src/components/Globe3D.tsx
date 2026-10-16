/**
 * MINERAL EARTH 3D — Visor planetario con CesiumJS
 * 
 * FASE 6.1D: Controles externos mediante ref forwarding
 * - Mantiene toda la lógica interna de capas, búsqueda, cámara
 * - Expone API mediante Globe3DHandle para controles externos
 * - No incluye paneles flotantes sobre el visor
 */

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { configureCesium, BASE_IMAGERY_PROVIDERS, WMS_SERVICES, PILOT_AREA } from '../lib/cesiumConfig';
import { useMission } from '../lib/store';

configureCesium();

let CesiumModule: any = null;

// API expuesta para controles externos
export interface Globe3DHandle {
  flyToLocation: (lat: number, lon: number, height?: number) => void;
  resetView: () => void;
  toggleLayer: (layer: 'eumetsat' | 'ignPnoa' | 'igmeGeology' | 'terrain') => void;
  setBaseImagery: (provider: keyof typeof BASE_IMAGERY_PROVIDERS) => void;
  getCameraInfo: () => { lat: number; lon: number; height: number };
  getActiveLayers: () => { eumetsat: boolean; ignPnoa: boolean; igmeGeology: boolean; terrain: boolean };
  getTerrainStatus: () => 'ELLIPSOID' | 'REAL';
}

interface Globe3DProps {
  onReady?: () => void;
}

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ onReady }, ref) => {
  const { state } = useMission();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  
  // CORRECCIÓN ERROR A: Registro de capas por claves estables
  const layersRef = useRef<{
    base: any;
    eumetsat: any;
    ignPnoa: any;
    ignBase: any;
    igmeGeology: any;
  }>({
    base: null,
    eumetsat: null,
    ignPnoa: null,
    ignBase: null,
    igmeGeology: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    eumetsat: false,
    ignPnoa: false,
    ignBase: false,
    igmeGeology: false,
    terrain: false,
  });
  const [cameraInfo, setCameraInfo] = useState({
    lat: PILOT_AREA.center.lat,
    lon: PILOT_AREA.center.lon,
    height: PILOT_AREA.center.height,
  });
  const [terrainStatus, setTerrainStatus] = useState<'ELLIPSOID' | 'REAL'>('ELLIPSOID');

  // FASE 6.1D: Exponer API para controles externos
  useImperativeHandle(ref, () => ({
    flyToLocation: (lat: number, lon: number, height: number = 10000) => {
      const viewer = viewerRef.current;
      if (!viewer || !CesiumModule) return;
      
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.error('Coordenadas fuera de rango');
        return;
      }
      
      viewer.camera.flyTo({
        destination: CesiumModule.Cartesian3.fromDegrees(lon, lat, height),
        duration: 2,
      });
    },
    
    resetView: () => {
      const viewer = viewerRef.current;
      if (!viewer || !CesiumModule) return;
      
      viewer.camera.flyTo({
        destination: CesiumModule.Cartesian3.fromDegrees(
          PILOT_AREA.center.lon,
          PILOT_AREA.center.lat,
          PILOT_AREA.center.height
        ),
        duration: 2,
      });
    },
    
    toggleLayer: (layer: 'eumetsat' | 'ignPnoa' | 'igmeGeology' | 'terrain') => {
      setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    },
    
    setBaseImagery: (provider: keyof typeof BASE_IMAGERY_PROVIDERS) => {
      const viewer = viewerRef.current;
      if (!viewer || !CesiumModule || !layersRef.current.base) return;
      
      const config = BASE_IMAGERY_PROVIDERS[provider];
      if (!config) return;
      
      // Remover capa base actual
      viewer.imageryLayers.remove(layersRef.current.base);
      
      // Añadir nueva capa base
      const imageryProvider = new CesiumModule.UrlTemplateImageryProvider({
        url: config.url,
        credit: new CesiumModule.Credit(config.credit),
        maximumLevel: config.maxZoom,
      });
      layersRef.current.base = viewer.imageryLayers.addImageryProvider(imageryProvider);
    },
    
    getCameraInfo: () => cameraInfo,
    getActiveLayers: () => activeLayers,
    getTerrainStatus: () => terrainStatus,
  }), [cameraInfo, activeLayers, terrainStatus]);

  // CORRECCIÓN ERROR D: Inicialización asíncrona segura
  useEffect(() => {
    isMountedRef.current = true;
    let viewer: any = null;

    async function initCesium() {
      try {
        const Cesium = await import('cesium');
        CesiumModule = Cesium;
        
        if (!isMountedRef.current || !containerRef.current) return;

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

        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.fog.enabled = true;

        // CORRECCIÓN ERROR A: Capa base con referencia estable
        const baseProvider = BASE_IMAGERY_PROVIDERS.ESRI_WORLD_IMAGERY;
        const imageryProvider = new Cesium.UrlTemplateImageryProvider({
          url: baseProvider.url,
          credit: new Cesium.Credit(baseProvider.credit),
          maximumLevel: baseProvider.maxZoom,
        });
        const baseLayer = viewer.imageryLayers.addImageryProvider(imageryProvider);
        layersRef.current.base = baseLayer;

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            PILOT_AREA.center.lon,
            PILOT_AREA.center.lat,
            PILOT_AREA.center.height
          ),
          duration: 2,
        });

        viewer.camera.changed.addEventListener(() => {
          if (!isMountedRef.current) return;
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
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Error inicializando CesiumJS');
          setIsLoading(false);
        }
      }
    }

    initCesium();

    return () => {
      isMountedRef.current = false;
      if (viewer) {
        viewer.destroy();
        viewerRef.current = null;
      }
    };
  }, [onReady]);

  // CORRECCIÓN ERROR A: Gestión de capas por referencia
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !CesiumModule) return;

    const Cesium = CesiumModule;

    // EUMETSAT (CORRECCIÓN: nombres reales de capas verificados)
    if (activeLayers.eumetsat && !layersRef.current.eumetsat) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.EUMETVIEW.url,
        layers: 'msg_fes:rgb_dust', // Nombre real verificado
        parameters: { 
          transparent: true, 
          format: 'image/png',
          version: '1.3.0',
        },
      });
      layersRef.current.eumetsat = viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.eumetsat && layersRef.current.eumetsat) {
      viewer.imageryLayers.remove(layersRef.current.eumetsat);
      layersRef.current.eumetsat = null;
    }

    // IGN PNOA
    if (activeLayers.ignPnoa && !layersRef.current.ignPnoa) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.IGN_PNOA.url,
        layers: 'OI.OrthoimageCoverage',
        parameters: { transparent: true, format: 'image/png' },
      });
      layersRef.current.ignPnoa = viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.ignPnoa && layersRef.current.ignPnoa) {
      viewer.imageryLayers.remove(layersRef.current.ignPnoa);
      layersRef.current.ignPnoa = null;
    }

    // IGME Geología
    if (activeLayers.igmeGeology && !layersRef.current.igmeGeology) {
      const provider = new Cesium.WebMapServiceImageryProvider({
        url: WMS_SERVICES.IGME_GEOLOGIA.url,
        layers: '0',
        parameters: { transparent: true, format: 'image/png' },
      });
      layersRef.current.igmeGeology = viewer.imageryLayers.addImageryProvider(provider);
    } else if (!activeLayers.igmeGeology && layersRef.current.igmeGeology) {
      viewer.imageryLayers.remove(layersRef.current.igmeGeology);
      layersRef.current.igmeGeology = null;
    }
  }, [activeLayers.eumetsat, activeLayers.ignPnoa, activeLayers.igmeGeology]);

  // CORRECCIÓN ERROR B: Interruptor de terreno funcional
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !CesiumModule) return;

    if (activeLayers.terrain) {
      // Intentar cargar terreno real (requiere token de Cesium ion)
      // Por ahora, mostrar mensaje de que no hay relieve real disponible
      setTerrainStatus('ELLIPSOID');
      // En producción, aquí se cargaría Cesium World Terrain con token
      // viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
    } else {
      viewer.terrainProvider = new CesiumModule.EllipsoidTerrainProvider();
      setTerrainStatus('ELLIPSOID');
    }
  }, [activeLayers.terrain]);

  // FASE 6.1D: Funciones internas eliminadas - ahora se acceden mediante ref
  // flyTo, resetView, toggleLayer están expuestas en useImperativeHandle

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

  // CORRECCIÓN FASE 6.1C: Visor 3D limpio sin paneles superpuestos
  // Los controles se mueven al panel lateral del Command Center
  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* Contenedor principal de CesiumJS - ocupa todo el espacio disponible */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay de carga - solo visible durante inicialización */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-pulse">🌍</div>
            <h3 className="text-xl font-bold text-white mb-2">Cargando MINERAL EARTH 3D</h3>
            <p className="text-sm text-gray-400">Inicializando motor CesiumJS...</p>
          </div>
        </div>
      )}

      {/* Barra de estado compacta - solo información esencial */}
      {!isLoading && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm rounded px-3 py-1.5 text-xs border border-gray-700 z-10">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Lat: <span className="text-white font-mono">{cameraInfo.lat.toFixed(4)}°</span>
            </span>
            <span className="text-gray-400">
              Lon: <span className="text-white font-mono">{cameraInfo.lon.toFixed(4)}°</span>
            </span>
            <span className="text-gray-400">
              Alt: <span className="text-white font-mono">{(cameraInfo.height / 1000).toFixed(1)}km</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] ${
              terrainStatus === 'REAL' ? 'bg-green-900/40 text-green-300' : 'bg-amber-900/40 text-amber-300'
            }`}>
              {terrainStatus === 'REAL' ? '✓ Terreno Real' : '⚠ Elipsoide'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

Globe3D.displayName = 'Globe3D';

export default Globe3D;
