# SECURITY_AUDIT_FASE3.md

## Auditoría de seguridad — Fase 3

### Dependencias

```
npm audit:
- 4 vulnerabilities (3 moderate, 1 high)
- Ninguna crítica
- No se desactivaron controles de seguridad
```

### Protección de archivos

| Control | Estado |
|---|---|
| Validación de firma LASF | ✅ Implementado |
| Límite de tamaño de archivo | ⚠️ No impuesto (depende del navegador) |
| Validación de estructura GeoTIFF | ✅ Delegada a geotiff.js |
| Sanitización de popups HTML | ✅ escapeHtml() en MapView |
| Sanitización CSV | ✅ Escape de comillas, protección de fórmulas |
| No exposición de secretos | ✅ Sin credenciales en código |
| Prevención de SSRF | ⚠️ Proxy allorigins solo para desarrollo |

### Protección de datos

| Control | Estado |
|---|---|
| No se publican coordenadas exactas del cortijo | ✅ UNVERIFIED |
| No se acreditan derechos mineros | ✅ Advertencia preservada |
| No se confirman minas sin evidencia | ✅ Invariante verificado |
| Separación DEMO/REAL | ✅ Implementado |
| Clasificación de datos | ✅ 7 categorías |

### Protección legal

| Control | Estado |
|---|---|
| Advertencia de no titularidad | ✅ En Dashboard, Docs, PDF |
| Revisión humana requerida | ✅ Marcado en todas las anomalías |
| No atribuye derechos de acceso | ✅ Documentado |
| No sustituye peritaje | ✅ Metodología documentada |

### Vulnerabilidades conocidas

1. **Proxy CORS (allorigins.win):** Solo para desarrollo. No usar en producción.
2. **Archivos grandes:** El navegador puede bloquearse con archivos > 1 GB.
3. **laz-perf WASM:** Requiere navegador moderno. Sin fallback.

### Recomendaciones para producción

1. Implementar proxy CORS propio con whitelist
2. Añadir límite de tamaño de archivo (ej. 500 MB)
3. Implementar streaming para archivos grandes
4. Añadir rate limiting al proxy
5. Validar tipos MIME en la subida
6. Considerar sandboxing del WASM

## Estado: PASS con recomendaciones
