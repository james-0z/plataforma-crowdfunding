# Qué se corrigió respecto a la versión anterior

| Problema detectado | Solución |
|---|---|
| Nunca se cerraban campañas ni se reembolsaba | `settlement.service.ts` + job periódico + `POST /admin/settle` |
| Se podía aportar a campañas vencidas | Validación de fecha en `contribution.service.ts` |
| Monto `"abc"` dejaba la campaña en `NaN` | Esquemas Zod (`moneySchema`) + suma en SQL NUMERIC |
| `ON DELETE CASCADE` borraba aportes de terceros | `ON DELETE RESTRICT` |
| Secretos del `.env.example` iguales a los reales | `JWT_ACCESS_SECRET` obligatorio, sin valor por defecto, ≥ 32 caracteres |
| Frontend 100 % con datos falsos y sin login real | Cliente HTTP, `authStore` real, guards de ruta, refresh automático |
| Crear campaña no guardaba nada | `POST /campaigns` conectado |
| Categorías distintas en 3 sitios (`documental` no existía) | Una sola fuente: tabla `categorias` + `GET /categories` |
| Campos `snake_case` en el backend y `camelCase` en el frontend | El backend responde en camelCase (`utils/mappers.ts`) |
| Datos de ejemplo repetidos en 4 archivos | Eliminados; todo viene de la API |
| `CampaignCard` duplicaba `ProgressBar` | `CampaignCard` usa `ProgressBar` |
| CSS repetido (`.badge`, `.form-group`, `.btn-*`…) | `styles.css` global + `StatusBadge` |
| `compaign.*` (typo) y `contribution.middleware.ts` en models | Renombrados; modelos ahora sí se usan |
| `index.ts` roto (import sin `.js`, `PUERTO`) | Eliminado; único punto de entrada `server.ts` |
| `start:node` roto (ts-node con TS 7) | `tsx watch` para desarrollo |
| `tsconfig` con `bundler` ocultaba imports inválidos | `NodeNext` |
| `errorHandler` y `express-async-errors` sin usar | `errorHandler` registrado + `asyncHandler` |
| `dotenv.config()` en 4 archivos | Una sola llamada en `config/env.ts` |
| Token inválido respondía 403 | 401; además RBAC con `requireRole` |
| `/api/db-check` público filtraba errores | Eliminado |
| Fecha mínima desfasada por UTC (`toISOString`) | `todayLocal()` en hora local |
| Fechas `DATE` serializadas con zona horaria | `to_char(fecha_limite, 'YYYY-MM-DD')` |
| `CampaignCard` mostraba 100 % con 99,6 % | `Math.floor`, sin redondeo hacia arriba |
| Sin responsive | Menú móvil, tablas con scroll, layouts adaptables |
| README prometía doble token, RBAC, etc. sin cumplirlo | Implementado y documentado |
| `index.html` en inglés con título "frontend" | `lang="es"` y título real |
| Código muerto (plantilla de Vite, `HelloWorld`, bloques comentados) | Eliminado |
| CRLF marcaba 40 archivos como modificados | `.gitattributes` |
