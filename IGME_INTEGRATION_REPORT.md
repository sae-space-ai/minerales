# IGME_INTEGRATION_REPORT.md

## Conector IGME — Fase 3

### Estado actual

**Módulo:** `src/lib/igmeClient.ts`
**Estado:** BLOCKED_EXTERNAL (CORS)

### Endpoint verificado

```
https://mapas.igme.es/gis/rest/services/BasesDatos/IGME_BDMIN_Indicios/MapServer/0/query
```

### Estados implementados

| Estado | Descripción |
|---|---|
| NOT_QUERIED | No se ha ejecutado la consulta |
| QUERY_SUCCESS | Respuesta válida con registros |
| QUERY_EMPTY | Respuesta válida sin registros |
| QUERY_FAILED | Error CORS, HTTP, o del servicio |
| QUERY_PARTIAL | Respuesta incompleta |
| QUERY_TIMEOUT | Tiempo de espera excedido |
| QUERY_UNSUPPORTED | Servicio no disponible |

### Limitación CORS

El servidor IGME no envía cabeceras CORS para peticiones desde orígenes arbitrarios. Esto impide la consulta directa desde el navegador.

### Soluciones implementadas

1. ✅ Intento de consulta directa
2. ✅ Fallback a proxy allorigins.win (solo desarrollo)
3. ✅ Registro honesto de QUERY_FAILED con totalFeatures = null
4. ✅ Nunca se devuelve 0 cuando la consulta falla

### Solución requerida para producción

Implementar un proxy del lado servidor que:
- Consulte solo dominios oficiales permitidos (whitelist)
- Valide parámetros
- Limite peticiones (rate limiting)
- Impida SSRF
- Gestione errores
- Registre fuente y fecha
- Implemente paginación

### Regla de oro

**totalFeatures = null cuando la consulta falla. Nunca 0.**

## Estado: BLOCKED_EXTERNAL
