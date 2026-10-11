/**
 * Persistencia de MDT con IndexedDB
 * 
 * Permite conservar archivos MDT importados entre sesiones del navegador.
 * NO utiliza localStorage para grandes rasters.
 * Solo restaura datos cuya integridad y procedencia puedan verificarse.
 */

import { MDTData } from './mdtProcessor';

const DB_NAME = 'mineral01_mdt_cache';
const DB_VERSION = 1;
const STORE_NAME = 'mdt_data';

interface MDTCacheEntry {
  key: string;
  filename: string;
  checksumSHA256: string;
  mdt: MDTData;
  importedAt: string;
  fileSize: number;
  authorized: boolean; // El usuario autorizó conservar este archivo
}

/**
 * Inicializa la base de datos IndexedDB.
 */
export async function initMDTDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('filename', 'filename', { unique: false });
        store.createIndex('checksumSHA256', 'checksumSHA256', { unique: false });
        store.createIndex('authorized', 'authorized', { unique: false });
      }
    };
  });
}

/**
 * Guarda un MDT en IndexedDB.
 */
export async function saveMDTToCache(
  mdt: MDTData,
  filename: string,
  checksumSHA256: string,
  fileSize: number,
  authorized: boolean = true
): Promise<void> {
  const db = await initMDTDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const entry: MDTCacheEntry = {
      key: checksumSHA256,
      filename,
      checksumSHA256,
      mdt,
      importedAt: new Date().toISOString(),
      fileSize,
      authorized,
    };
    
    const request = store.put(entry);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Recupera un MDT de IndexedDB por su checksum.
 */
export async function loadMDTFromCache(checksumSHA256: string): Promise<MDTData | null> {
  const db = await initMDTDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(checksumSHA256);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entry = request.result as MDTCacheEntry | undefined;
      
      if (entry && entry.authorized) {
        resolve(entry.mdt);
      } else {
        resolve(null);
      }
    };
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Lista todos los MDTs cacheados.
 */
export async function listCachedMDTs(): Promise<Array<{
  filename: string;
  checksumSHA256: string;
  importedAt: string;
  fileSize: number;
  authorized: boolean;
}>> {
  const db = await initMDTDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const entries = request.result as MDTCacheEntry[];
      resolve(entries.map(e => ({
        filename: e.filename,
        checksumSHA256: e.checksumSHA256,
        importedAt: e.importedAt,
        fileSize: e.fileSize,
        authorized: e.authorized,
      })));
    };
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Elimina un MDT de la cache.
 */
export async function deleteMDTFromCache(checksumSHA256: string): Promise<void> {
  const db = await initMDTDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(checksumSHA256);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Limpia toda la cache de MDTs.
 */
export async function clearMDTCache(): Promise<void> {
  const db = await initMDTDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

/**
 * Verifica la integridad de un MDT cacheado.
 */
export function validateMDTIntegrity(mdt: MDTData): boolean {
  // Verificar que el grid existe y tiene el tamaño correcto
  if (!mdt.grid || !(mdt.grid instanceof Float32Array)) {
    return false;
  }
  
  const expectedSize = mdt.width * mdt.height;
  if (mdt.grid.length !== expectedSize) {
    return false;
  }
  
  // Verificar bounds
  if (mdt.bounds.xMin >= mdt.bounds.xMax || mdt.bounds.yMin >= mdt.bounds.yMax) {
    return false;
  }
  
  // Verificar resolución
  if (mdt.resolution <= 0) {
    return false;
  }
  
  // Verificar CRS
  if (!mdt.crs || mdt.crs.trim() === '') {
    return false;
  }
  
  return true;
}
