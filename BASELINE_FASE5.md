# BASELINE_FASE5.md — MINERAL-01

## Estado inicial Fase 5

**Fecha:** 2026-01-15
**Rama:** mineral-01-geospatial-mission-95a57
**Estado post-Fase 4:** PARTIAL

## Auditoría de errores críticos identificados

### ERROR A — Gestión de capas por posición (CRÍTICO)
**Archivo:** src/components/Globe3D.tsx
**Problema:** Uso de `viewer.imageryLayers.get(1)`, `get(2)`, `get(3)` para controlar capas
**Causa:** El orden cambia dinámicamente al activar/desactivar capas
**Impacto:** Se eliminan capas incorrectas, duplicación, comportamiento impredecible
**Solución:** Registro de capas por claves estables con referencias directas

### ERROR B — Interruptor de terreno (CRÍTICO)
**Archivo:** src/components/Globe3D.tsx
**Problema:** Boolean `activeLayers.terrain` no cambia el terrain provider
**Causa:** Falta implementación de cambio de proveedor de elevación
**Impacto:** El control no hace nada real
**Solución:** Implementar cambio entre EllipsoidTerrainProvider y terrain real

### ERROR C — Capas declaradas pero no representadas (CRÍTICO)
**Archivos:** Globe3D.tsx, cesiumConfig.ts
**Problema:** Controles para ignBase, missionArea, anomalies sin implementación
**Causa:** UI sin lógica de visualización
**Impacto:** Controles decorativos sin funcionalidad
**Solución:** Implementar visualización real o desactivar controles

### ERROR D — Inicialización asíncrona (CRÍTICO)
**Archivo:** src/components/Globe3D.tsx
**Problema:** Posibles condiciones de carrera, llamadas post-destrucción
**Causa:** useEffect sin cleanup adecuado, referencias obsoletas
**Impacto:** Pérdidas de memoria, errores en consola
**Solución:** isMounted flag, cleanup correcto, validación de referencias

### ERROR E — Discrepancia versión CesiumJS (CRÍTICO)
**Archivos:** package.json, cesiumConfig.ts
**Problema:** Instalado 1.146.0, configurado CDN 1.119
**Causa:** URL hardcoded con versión antigua
**Impacto:** Assets incompatibles, errores de carga
**Solución:** Usar assets de la versión instalada o actualizar URL

### ERROR F — Búsqueda y cámara (CRÍTICO)
**Archivo:** src/components/Globe3D.tsx
**Problema:** Solo reconoce coordenadas, no nombres de lugares
**Causa:** Geocoder de Cesium no configurado correctamente
**Impacto:** Búsqueda limitada
**Solución:** Configurar geocoder con proveedor autorizado

### ERROR G — Coordenadas inconsistentes (CRÍTICO)
**Archivos:** cesiumConfig.ts, coordinates.ts
**Problema:** Bounds LAZ no coinciden con punto provisional Matarrama
**Causa:** Transformación incorrecta o datos inconsistentes
**Impacto:** Confusión entre ubicación cortijo, arroyo y cobertura LAZ
**Solución:** Verificar transformación EPSG:25829 → WGS84, separar conceptos

### ERROR H — Herramientas de medición no implementadas (ALTO)
**Estado:** NOT_IMPLEMENTED
**Impacto:** Funcionalidad esencial pendiente
**Solución:** Implementar medición de distancias, áreas, perfiles

### ERROR I — Timeline temporal no implementado (ALTO)
**Estado:** NOT_IMPLEMENTED
**Impacto:** No se puede comparar observaciones temporales
**Solución:** Implementar selector de fecha/hora para servicios con dimensión temporal

### ERROR J — MINERAL-AI no conectado al globo (ALTO)
**Estado:** PARTIAL
**Impacto:** Comandos de navegación no funcionan
**Solución:** Exponer API de Globe3D, conectar con AIPanel

### ERROR K — EUMETSAT no verificado (MEDIO)
**Estado:** OPERATIONAL_VERIFIED (declarado)
**Problema:** No se ha ejecutado GetCapabilities real
**Impacto:** Capas pueden no existir o tener nombres diferentes
**Solución:** Verificar GetCapabilities, usar nombres reales

### ERROR L — IGN no verificado (MEDIO)
**Estado:** OPERATIONAL_VERIFIED (declarado)
**Problema:** No se ha ejecutado GetCapabilities real
**Impacto:** Capas pueden no existir o tener nombres diferentes
**Solución:** Verificar GetCapabilities, usar nombres reales

### ERROR M — IGME CORS bloqueado (ALTO)
**Estado:** BLOCKED_EXTERNAL
**Problema:** Proxy allorigins.win no apto para producción
**Impacto:** Consulta BDMIN no funciona en producción
**Solución:** Implementar proxy serverless propio

### ERROR N — Relieve 3D real no disponible (ALTO)
**Estado:** PARTIAL
**Problema:** Solo elipsoide (plano), Cesium World Terrain requiere token
**Impacto:** No hay relieve real sin credenciales
**Solución:** Investigar alternativas gratuitas o implementar conversión MDT → terrain

## Build de referencia (Fase 4)
- `npm run build`: ✅ PASS
- 3320 módulos transformados
- CesiumJS: 4.9 MB (lazy loaded)

## Estrategia Fase 5
1. Corregir errores críticos A-F (gestión capas, terreno, coordenadas)
2. Verificar servicios EUMETSAT e IGN con GetCapabilities reales
3. Implementar herramientas de medición 3D
4. Implementar timeline temporal
5. Conectar MINERAL-AI con Globe3D
6. Implementar proxy IGME serverless
7. Investigar relieve 3D gratuito
8. Ejecutar pruebas integrales
9. Documentar resultados reales
