# MINERAL_AI_3D_INTEGRATION.md

## Integración MINERAL-AI con GLOBO 3D — Fase 4

### Estado actual

**Módulo AI:** src/lib/mineralAI.ts (operativo desde Fase 3)
**Módulo 3D:** src/components/Globe3D.tsx (operativo desde Fase 4)
**Integración:** ⚠️ PARTIAL (comandos de navegación no conectados)

### Comandos AI planificados para 3D

| Comando | Acción 3D | Estado |
|---|---|---|
| "Muéstrame el Cortijo de Daniela" | flyTo(38.02, -6.07, 5000) | ⚠️ PENDING |
| "Acércate al arroyo de Matarrama" | flyTo(38.0125, -6.06628, 2000) | ⚠️ PENDING |
| "Activa el relieve 3D" | toggleLayer('terrain') | ⚠️ PENDING |
| "Superpone ortofotos IGN" | toggleLayer('ignPnoa') | ⚠️ PENDING |
| "Activa capas EUMETSAT" | toggleLayer('eumetsat') | ⚠️ PENDING |
| "Compara dos fechas" | timeline (no implementado) | ❌ BLOCKED |
| "Muéstrame indicios IGME" | toggleLayer('igmeGeology') | ⚠️ PENDING |
| "Calcula perfil topográfico" | measurement tools | ❌ NOT_IMPLEMENTED |
| "Busca anomalías en polígono" | selection + analysis | ❌ NOT_IMPLEMENTED |

### Limitaciones

- AI Panel y Globe3D no comparten referencia de viewer
- Comandos de navegación requieren acceso a CesiumModule
- Herramientas de medición no implementadas
- Timeline temporal no disponible

### Recomendación

Para integración completa:
1. Exponer funciones de Globe3D via context
2. Conectar AI Panel con Globe3D context
3. Implementar herramientas de medición
4. Añadir timeline cuando haya datos temporales

## Estado: PARTIAL (AI operativo, integración 3D pendiente)
