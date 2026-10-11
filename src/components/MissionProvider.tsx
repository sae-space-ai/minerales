import { useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import {
  MissionContext,
  MissionState,
  initialMissionState,
  DEMO_ANOMALIES,
  DEMO_COVERAGE_GAPS,
} from '../lib/store';
import { readLASHeader, computeSHA256, computePointDensity } from '../lib/lasReader';
import { decompressLAZ } from '../lib/lazProcessor';
import { loadMDTFromFile, MDTData } from '../lib/mdtProcessor';
import { queryIGME, queryIGMEViaProxy } from '../lib/igmeClient';
import { saveMDTToCache, loadMDTFromCache, validateMDTIntegrity } from '../lib/mdtPersistence';

interface MissionProviderProps {
  children: ReactNode;
}

export function MissionProvider({ children }: MissionProviderProps) {
  const [state, setState] = useState<MissionState>(() => {
    // En modo DEMO, cargar datos sintéticos
    const demoState = { ...initialMissionState };
    demoState.anomalies = DEMO_ANOMALIES;
    demoState.coverageGaps = DEMO_COVERAGE_GAPS;
    return demoState;
  });

  // Referencia estable para el MDT completo (no se guarda en estado React para evitar re-renders)
  const mdtDataRef = useRef<MDTData | null>(null);

  // Restaurar MDT de IndexedDB al iniciar (si existe y está autorizado)
  useEffect(() => {
    const restoreMDT = async () => {
      try {
        // Intentar cargar el último MDT cacheado
        // Por ahora usamos una clave fija, en el futuro podríamos listar y seleccionar
        const cachedMDT = await loadMDTFromCache('latest');
        
        if (cachedMDT && validateMDTIntegrity(cachedMDT)) {
          mdtDataRef.current = cachedMDT;
          setState((prev) => ({
            ...prev,
            mdt: {
              filename: cachedMDT.source,
              width: cachedMDT.width,
              height: cachedMDT.height,
              resolution: cachedMDT.resolution,
              bounds: cachedMDT.bounds,
              crs: cachedMDT.crs,
              noDataValue: cachedMDT.noDataValue,
              status: 'COMPLETED',
              dataClassification: 'SOURCE_VERIFIED',
              timestamp: cachedMDT.timestamp,
              errorMessage: null,
            },
          }));
          console.log('✅ MDT restaurado desde IndexedDB:', cachedMDT.source);
        }
      } catch (error) {
        console.warn('No se pudo restaurar MDT desde IndexedDB:', error);
      }
    };

    restoreMDT();
  }, []);

  const setMode = useCallback((mode: 'DEMO' | 'REAL') => {
    setState((prev) => {
      const newState = { ...prev, mode, updatedAt: new Date().toISOString() };
      if (mode === 'REAL') {
        // En modo REAL, excluir datos DEMO_SYNTHETIC
        newState.anomalies = prev.anomalies.filter(
          (a) => a.dataClassification !== 'DEMO_SYNTHETIC'
        );
        newState.coverageGaps = prev.coverageGaps.filter(
          (g) => g.dataClassification !== 'DEMO_SYNTHETIC'
        );
      } else {
        // En modo DEMO, restaurar datos sintéticos
        newState.anomalies = [
          ...prev.anomalies.filter((a) => a.dataClassification !== 'DEMO_SYNTHETIC'),
          ...DEMO_ANOMALIES,
        ];
        newState.coverageGaps = [
          ...prev.coverageGaps.filter((g) => g.dataClassification !== 'DEMO_SYNTHETIC'),
          ...DEMO_COVERAGE_GAPS,
        ];
      }
      return newState;
    });
  }, []);

  const loadLASFile = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      lasFile: {
        ...prev.lasFile,
        filename: file.name,
        fileSize: file.size,
        status: 'IN_PROGRESS',
        errorMessage: null,
      },
    }));

    try {
      const buffer = await file.arrayBuffer();
      const header = readLASHeader(buffer, file.name);

      if (header.status === 'PARSE_ERROR') {
        setState((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          lasFile: {
            ...prev.lasFile,
            status: 'FAILED',
            errorMessage: header.errorMessage || 'Error de parseo',
            dataClassification: 'FAILED',
          },
        }));
        return;
      }

      const checksum = await computeSHA256(buffer);
      const density = computePointDensity(header);

      // Determinar CRS
      let crsOriginal = 'DESCONOCIDO';
      let crsEPSG: number | null = null;
      if (header.detectedCRS) {
        crsOriginal = header.detectedCRS;
      } else if (header.xMin >= 700000 && header.xMin < 800000) {
        // Heurística: si X está en rango 700k-800k, probablemente UTM 29N o 30N
        // Para la Península Ibérica, 757000 es UTM 29N
        if (header.xMin >= 750000 && header.xMax <= 760000) {
          crsOriginal = 'EPSG:25829 (probable — no verificado en VLRs)';
          crsEPSG = 25829;
        } else if (header.xMin >= 200000 && header.xMax <= 700000) {
          crsOriginal = 'EPSG:25830 (probable — no verificado en VLRs)';
          crsEPSG = 25830;
        }
      }

      // Determinar estado
      let status: 'HEADER_ONLY' | 'BLOCKED_RUNTIME' = 'HEADER_ONLY';
      if (header.isCompressed) {
        status = 'BLOCKED_RUNTIME';
      }

      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        lasFile: {
          filename: file.name,
          fileSize: file.size,
          checksumSHA256: checksum,
          status,
          headerRead: true,
          pointsDecompressed: false,
          groundClassified: false,
          crsOriginal,
          crsEPSG,
          pointCount: header.numberOfPoints,
          pointFormat: header.pointDataRecordFormat,
          lasVersion: `${header.versionMajor}.${header.versionMinor}`,
          bounds: {
            xMin: header.xMin,
            xMax: header.xMax,
            yMin: header.yMin,
            yMax: header.yMax,
            zMin: header.zMin,
            zMax: header.zMax,
          },
          pointDensity: density,
          groundPointDensity: null,
          classDistribution: null,
          returnDistribution: null,
          dataClassification: 'SOURCE_VERIFIED',
          parseTimestamp: header.parseTimestamp,
          errorMessage: header.isCompressed
            ? 'LAZ comprimido: cabecera leída. Use "Procesar completo" para descomprimir con laz-perf.'
            : null,
          processingTimeMs: null,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        lasFile: {
          ...prev.lasFile,
          status: 'FAILED',
          errorMessage,
          dataClassification: 'FAILED',
        },
      }));
    }
  }, []);

  const queryIGMEAction = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      igme: {
        ...prev.igme,
        status: 'NOT_QUERIED',
        errorMessage: 'Consultando...',
      },
    }));

    // Usar bounds del archivo LAZ si está disponible
    const bounds = state.lasFile.bounds;
    let params;
    if (bounds.xMin !== null && bounds.xMax !== null) {
      params = {
        xmin: bounds.xMin,
        ymin: bounds.yMin!,
        xmax: bounds.xMax,
        ymax: bounds.yMax!,
        inSR: state.lasFile.crsEPSG || 25829,
        outSR: 4326,
      };
    } else {
      // Usar bounds de referencia del arroyo (provisional)
      params = {
        xmin: 757000,
        ymin: 4210000,
        xmax: 758000,
        ymax: 4210815,
        inSR: 25829,
        outSR: 4326,
      };
    }

    // Intentar consulta directa primero, luego proxy
    let result = await queryIGME(params);
    if (result.status === 'QUERY_FAILED' && result.errorMessage?.includes('CORS')) {
      result = await queryIGMEViaProxy(params);
    }

    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      igme: {
        endpoint: prev.igme.endpoint,
        status: result.status,
        lastQueryTimestamp: result.timestamp,
        lastQueryURL: result.url,
        crs: result.crs,
        totalFeatures: result.totalFeatures,
        features: result.features,
        errorMessage: result.errorMessage,
        httpStatus: result.httpStatus,
        dataClassification: result.dataClassification,
      },
    }));
  }, [state.lasFile.bounds, state.lasFile.crsEPSG]);

  const updateThresholds = useCallback(
    (thresholds: { minDepth: number; minSlope: number; minArea: number }) => {
      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        geomorphological: {
          ...prev.geomorphological,
          thresholds,
        },
      }));
    },
    []
  );

  const processLAZFull = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      lasFile: {
        ...prev.lasFile,
        status: 'IN_PROGRESS',
        errorMessage: null,
      },
    }));

    try {
      const buffer = await file.arrayBuffer();
      const result = await decompressLAZ(buffer, file.name);

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          lasFile: {
            ...prev.lasFile,
            status: 'BLOCKED_RUNTIME',
            errorMessage: result.errorMessage || 'Error de descompresión',
            dataClassification: 'FAILED',
          },
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        lasFile: {
          ...prev.lasFile,
          status: 'COMPLETED',
          pointsDecompressed: true,
          groundClassified: result.groundPointCount > 0,
          pointCount: result.pointCount,
          bounds: {
            xMin: result.bounds.xMin,
            xMax: result.bounds.xMax,
            yMin: result.bounds.yMin,
            yMax: result.bounds.yMax,
            zMin: result.bounds.zMin,
            zMax: result.bounds.zMax,
          },
          pointDensity: result.density.pointsPerSquareMeter,
          groundPointDensity: result.density.groundPointsPerSquareMeter,
          classDistribution: result.classDistribution,
          returnDistribution: result.returnDistribution,
          dataClassification: 'SOURCE_VERIFIED',
          processingTimeMs: result.processingTimeMs,
          errorMessage: null,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        lasFile: {
          ...prev.lasFile,
          status: 'FAILED',
          errorMessage,
          dataClassification: 'FAILED',
        },
      }));
    }
  }, []);

  const loadMDT = useCallback(async (file: File) => {
    // Invalidar MDT anterior inmediatamente
    mdtDataRef.current = null;
    
    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      mdt: {
        ...prev.mdt,
        filename: file.name,
        status: 'IN_PROGRESS',
        errorMessage: null,
      },
    }));

    try {
      const result = await loadMDTFromFile(file);

      if (!result.success || !result.mdt) {
        // Limpiar ref en caso de fallo
        mdtDataRef.current = null;
        setState((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          mdt: {
            ...prev.mdt,
            status: 'FAILED',
            errorMessage: result.errorMessage || 'Error cargando MDT',
            dataClassification: 'FAILED',
          },
        }));
        return;
      }

      const mdt = result.mdt;
      
      // Guardar MDT completo en ref estable (no en estado React)
      mdtDataRef.current = mdt;
      
      // Guardar en IndexedDB para persistencia entre sesiones
      try {
        const checksum = await computeSHA256(await file.arrayBuffer());
        await saveMDTToCache(mdt, file.name, checksum, file.size, true);
        console.log('✅ MDT guardado en IndexedDB:', file.name);
      } catch (error) {
        console.warn('No se pudo guardar MDT en IndexedDB:', error);
        // No es crítico, continuamos sin persistencia
      }
      
      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        mdt: {
          filename: file.name,
          width: mdt.width,
          height: mdt.height,
          resolution: mdt.resolution,
          bounds: mdt.bounds,
          crs: mdt.crs,
          noDataValue: mdt.noDataValue,
          status: 'COMPLETED',
          dataClassification: 'SOURCE_VERIFIED',
          timestamp: mdt.timestamp,
          errorMessage: null,
        },
      }));
    } catch (error) {
      // Limpiar ref en caso de error
      mdtDataRef.current = null;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        mdt: {
          ...prev.mdt,
          status: 'FAILED',
          errorMessage,
          dataClassification: 'FAILED',
        },
      }));
    }
  }, []);

  // Función para obtener el MDT completo (usada por MINERAL-AI y herramientas científicas)
  const getLoadedMDT = useCallback((): MDTData | null => {
    // Solo devolver si el estado indica COMPLETED y el ref tiene datos
    if (state.mdt.status === 'COMPLETED' && mdtDataRef.current) {
      return mdtDataRef.current;
    }
    return null;
  }, [state.mdt.status]);

  return (
    <MissionContext.Provider
      value={{
        state,
        setMode,
        loadLASFile,
        processLAZFull,
        loadMDT,
        queryIGME: queryIGMEAction,
        updateThresholds,
        getLoadedMDT,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}
