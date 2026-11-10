# Referencia de la API

Base: `/api`. Todas las respuestas son JSON. Los errores tienen la forma:

```json
{ "error": "Mensaje legible", "code": "VALIDATION_ERROR", "details": [{ "campo": "monto", "mensaje": "..." }] }
```

Autenticación: cabecera `Authorization: Bearer <accessToken>`. El refresh token viaja solo en la cookie
HttpOnly `refresh_token` (ruta `/api/auth`).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado de la API |
| GET | `/categories` | público | Lista de categorías `{ items }` |
| POST | `/auth/register` | público | `{ nombre, email, password }` → `201 { user, accessToken }` + cookie |
| POST | `/auth/login` | público | `{ email, password }` → `{ user, accessToken }` + cookie |
| POST | `/auth/refresh` | cookie | Rota el refresh token y devuelve un access token nuevo |
| POST | `/auth/logout` | cookie | Revoca la sesión (`204`) |
| GET | `/auth/me` | usuario | Usuario autenticado |
| GET | `/campaigns` | público | Query: `categoria` (slug), `estado`, `q`, `page`, `pageSize` (≤ 50) → `{ items, total, page, pageSize }` |
| GET | `/campaigns/mine` | usuario | Campañas creadas por mí |
| GET | `/campaigns/:id` | público | Detalle |
| POST | `/campaigns` | usuario | `{ categoriaId, titulo, descripcion, metaMonto, fechaLimite }` → `201` |
| POST | `/contributions` | usuario | `{ campanaId, monto }` → `201 { contribution, campaign }` |
| GET | `/contributions/mine` | usuario | Mis aportes con estado de campaña y reembolso |
| POST | `/admin/settle` | **admin** | Fuerza el cierre de campañas vencidas |

### Códigos de estado usados

`200/201/204` éxito · `400` datos inválidos · `401` no autenticado o token expirado · `403` sin permiso
(p. ej. aportar a tu propia campaña) · `404` no existe · `409` conflicto (correo repetido, campaña cerrada) ·
`429` demasiados intentos · `500` error interno.

### Forma de una campaña

```json
{
  "id": 1, "titulo": "…", "descripcion": "…",
  "creadorId": 2, "creadorNombre": "Ana Gómez",
  "categoriaId": 2, "categoria": "Videojuegos", "categoriaSlug": "videojuegos",
  "metaMonto": 5000000, "montoRecaudado": 3500000,
  "fechaLimite": "2026-11-24", "estado": "activa", "diasRestantes": 20,
  "totalAportantes": 2, "creadoEn": "2026-11-04T…Z", "cerradoEn": null
}
```
