/**
 * Diagnóstico de versión y build
 * 
 * Muestra información sobre la versión desplegada, commit y fecha de compilación.
 * Permite verificar que el código desplegado coincide con el esperado.
 */

export interface BuildInfo {
  version: string;
  buildDate: string;
  commitHash: string;
  branch: string;
  environment: 'development' | 'production';
}

// Esta información se inyecta durante el build de Vite
// Para desarrollo, usamos valores por defecto
const env = (import.meta as any).env || {};

export const BUILD_INFO: BuildInfo = {
  version: env.VITE_APP_VERSION || '7.2.2',
  buildDate: env.VITE_BUILD_DATE || new Date().toISOString(),
  commitHash: env.VITE_COMMIT_HASH || 'development',
  branch: env.VITE_GIT_BRANCH || 'main',
  environment: env.DEV ? 'development' : 'production',
};

/**
 * Obtiene información de diagnóstico completa.
 */
export function getDiagnosticInfo(): {
  build: BuildInfo;
  runtime: {
    userAgent: string;
    language: string;
    platform: string;
    webglSupported: boolean;
    indexedDBSupported: boolean;
    memoryAvailable: number | null;
  };
  state: {
    mdtLoaded: boolean;
    mdtStatus: string;
    lasLoaded: boolean;
    lasStatus: string;
    mode: string;
  };
} {
  // Verificar capacidades del navegador
  const webglSupported = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  })();

  const indexedDBSupported = typeof indexedDB !== 'undefined';

  let memoryAvailable: number | null = null;
  if ('memory' in performance) {
    memoryAvailable = (performance as any).memory?.jsHeapSizeLimit || null;
  }

  return {
    build: BUILD_INFO,
    runtime: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      webglSupported,
      indexedDBSupported,
      memoryAvailable,
    },
    state: {
      mdtLoaded: false, // Se actualiza dinámicamente
      mdtStatus: 'NOT_LOADED',
      lasLoaded: false,
      lasStatus: 'NOT_LOADED',
      mode: 'DEMO',
    },
  };
}

/**
 * Formatea información de diagnóstico para mostrar.
 */
export function formatDiagnosticInfo(diag: ReturnType<typeof getDiagnosticInfo>): string {
  const lines = [
    '=== DIAGNÓSTICO MINERAL-01 ===',
    '',
    'BUILD:',
    `  Versión: ${diag.build.version}`,
    `  Fecha: ${new Date(diag.build.buildDate).toLocaleString('es-ES')}`,
    `  Commit: ${diag.build.commitHash}`,
    `  Rama: ${diag.build.branch}`,
    `  Entorno: ${diag.build.environment}`,
    '',
    'RUNTIME:',
    `  Navegador: ${diag.runtime.userAgent.substring(0, 80)}...`,
    `  Idioma: ${diag.runtime.language}`,
    `  Plataforma: ${diag.runtime.platform}`,
    `  WebGL: ${diag.runtime.webglSupported ? '✓ Soportado' : '✗ No soportado'}`,
    `  IndexedDB: ${diag.runtime.indexedDBSupported ? '✓ Soportado' : '✗ No soportado'}`,
    `  Memoria: ${diag.runtime.memoryAvailable ? `${(diag.runtime.memoryAvailable / 1024 / 1024).toFixed(0)} MB` : 'No disponible'}`,
    '',
    'ESTADO:',
    `  MDT: ${diag.state.mdtLoaded ? '✓ Cargado' : '✗ No cargado'} (${diag.state.mdtStatus})`,
    `  LAS: ${diag.state.lasLoaded ? '✓ Cargado' : '✗ No cargado'} (${diag.state.lasStatus})`,
    `  Modo: ${diag.state.mode}`,
  ];

  return lines.join('\n');
}
