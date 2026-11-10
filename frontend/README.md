# Frontend — CrowdFund

Vue 3 + Vite + Pinia + Vue Router + TypeScript. Consulta el [README principal](../README.md) para la puesta en marcha.

```bash
npm install
npm run dev        # http://localhost:5173 (proxy /api → http://localhost:3000)
npm run build      # typecheck + build de producción
npm test           # pruebas unitarias
```

Variables (`.env`): `VITE_API_URL` (por defecto `/api`), `VITE_CURRENCY` (por defecto `COP`).

En producción sirve `dist/` detrás del mismo dominio que la API (o configura `VITE_API_URL` y `CORS_ORIGIN`
del backend; con dominios distintos la cookie de sesión requiere `SameSite=None; Secure`).
