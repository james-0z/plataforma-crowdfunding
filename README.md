# 🚀 CrowdFund — Plataforma de crowdfunding All-or-Nothing

Plataforma de financiamiento colectivo donde **un proyecto solo recibe los fondos si alcanza su meta
antes de la fecha límite**. Si no la alcanza, **todos los aportes se reembolsan automáticamente**.

| Capa | Tecnología |
|---|---|
| Backend | Node.js 20+, Express 4, TypeScript, PostgreSQL, Zod |
| Frontend | Vue 3, Vite, Pinia, Vue Router, TypeScript |
| Seguridad | Access token JWT (15 min, **en memoria**) + Refresh token (7 días, **cookie HttpOnly**, con rotación y detección de reutilización), RBAC, bcrypt, Helmet, rate limiting |
| Calidad | 52 tests de integración en el backend (API completa sobre PostgreSQL embebido) + tests del frontend |

## ⚙️ Cómo funciona el modelo All-or-Nothing

```
            crear campaña                 aportes (hasta la fecha límite, inclusive)
   ┌─────────────┐   ┌────────────────────────────────────────────┐
   │   ACTIVA    │──▶│  sigue abierta aunque llegue al 100 %      │
   └──────┬──────┘   └────────────────────────────────────────────┘
          │ vence la fecha límite → cierre automático (job cada 60 s)
   ┌──────┴───────────────┬────────────────────────────────┐
   ▼ recaudado ≥ meta     ▼ recaudado < meta
 ┌─────────┐         ┌──────────┐
 │ EXITOSA │         │ FALLIDA  │ → todos los aportes quedan marcados como REEMBOLSADOS
 └─────────┘         └──────────┘
```

Reglas aplicadas en el servidor (el frontend nunca decide el resultado):

- No se acepta un aporte si la campaña está cerrada o su fecha límite ya pasó.
- El creador no puede aportar a su propia campaña.
- Montos: entre 1 y 100.000.000, máximo 2 decimales. Se rechazan `NaN`, texto, negativos, etc.
- La suma del recaudado se hace **en SQL (NUMERIC)**, sin errores de punto flotante.
- Duración de una campaña: de mañana hasta 60 días. Meta mínima: 10.
- El cierre es **idempotente**: ejecutarlo dos veces no reembolsa dos veces.

> ⚠️ **Alcance:** no hay pasarela de pagos real. "Reembolsado" es el registro contable que una integración
> (Stripe, Wompi, PayU…) usaría para ordenar la devolución del dinero. Es el siguiente paso natural.

## 🗂️ Estructura

```
plataforma-crowdfunding/
├── backend/
│   ├── src/
│   │   ├── config/        env.ts (validación con Zod), db.ts (pool + transacciones)
│   │   ├── controllers/   capa HTTP delgada
│   │   ├── services/      reglas de negocio (auth, campañas, aportes, cierre)
│   │   ├── routes/        definición de endpoints
│   │   ├── middlewares/   autenticación, roles (RBAC), validación, errores
│   │   ├── validators/    esquemas Zod (única fuente de validación)
│   │   ├── models/        tipos del dominio
│   │   ├── jobs/          cierre automático de campañas vencidas
│   │   ├── database/      schema.sql, migrate.ts, seed.ts
│   │   └── utils/         hash, tokens, fechas, mapeo BD → API
│   └── tests/             pruebas de integración
├── frontend/
│   └── src/
│       ├── api/           cliente HTTP único + un archivo por recurso
│       ├── stores/        Pinia (sesión, categorías)
│       ├── router/        rutas con guards (auth / admin / invitado)
│       ├── components/    StatusBadge, ProgressBar, CampaignCard, NavBar, Footer
│       ├── layouts/       Main, Auth, Dashboard
│       ├── views/         páginas
│       ├── types/         tipos que reflejan la API
│       └── utils/         formateo de montos y fechas
├── docs/API.md            referencia de endpoints
└── docker-compose.yml     PostgreSQL para desarrollo
```

## 🧰 Puesta en marcha

Requisitos: **Node.js 20+** y **PostgreSQL 14+** (o Docker).

### 1. Base de datos

```bash
docker compose up -d          # opción rápida; o usa tu PostgreSQL local y crea la BD crowdfunding_db
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # y edita: DB_PASSWORD y JWT_ACCESS_SECRET
openssl rand -hex 32          # genera el valor para JWT_ACCESS_SECRET
npm install
npm run db:init               # crea tablas y categorías
npm run db:seed               # (opcional) datos de demostración
npm run dev                   # http://localhost:3000/api/health
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # opcional: cambia VITE_CURRENCY (COP)
npm install
npm run dev                   # http://localhost:5173
```

En desarrollo, Vite reenvía `/api` al backend, así la cookie de sesión funciona sin configurar CORS.

### Usuarios de demostración (tras `npm run db:seed`, contraseña `Demo1234`)

| Usuario | Rol |
|---|---|
| admin@crowdfund.test | Administrador |
| ana@crowdfund.test · luis@crowdfund.test · sofia@crowdfund.test | Usuario |

## 🎬 Guion sugerido para la presentación

1. **Inicio** → explica el modelo All-or-Nothing y muestra las campañas destacadas.
2. **Campañas** → filtra por categoría, busca por texto; entra a una y muestra progreso, días restantes y reglas.
3. **Regístrate** como usuario nuevo → crea una campaña (muestra las validaciones: fecha pasada, meta inválida…).
4. **Entra como otro usuario** → aporta con los botones rápidos; intenta aportar a tu propia campaña (se bloquea).
5. **Cierre automático**: el seed deja 2 campañas ya vencidas. Entra como `admin@crowdfund.test` →
   *Administración* → **Procesar cierres ahora**: una pasa a *exitosa* y la otra a *fallida*.
6. **Mis aportes** (como Ana o Sofía) → muestra el aporte *reembolsado* en la campaña fallida.
7. Cierra con la seguridad: refresh token en cookie HttpOnly, RBAC (un usuario común recibe 403 en `/admin`) y los tests.

## ✅ Pruebas

```bash
cd backend  && npm test          # 52 pruebas: auth, validaciones, aportes, concurrencia, cierre y reembolsos
cd frontend && npm test          # utilidades de formato
npm run typecheck                # en ambos proyectos
```

Los tests del backend ejecutan la API real (Express + Supertest) sobre **PGlite** (PostgreSQL embebido), por lo
que no necesitan una base de datos instalada.

## 🔐 Seguridad implementada

- Contraseñas con **bcrypt** (12 rondas); mínimo 8 caracteres con letras y números; máx. 72 bytes (límite de bcrypt).
- **Refresh tokens opacos** guardados como hash SHA-256; **rotación** en cada uso y revocación de todas las
  sesiones si se reutiliza uno viejo (posible robo).
- Mismo mensaje y mismo tiempo de respuesta para "correo inexistente" y "contraseña incorrecta".
- `401` para token inválido/expirado y `403` para falta de permisos.
- **Helmet**, CORS restringido a `CORS_ORIGIN`, límite de 10 intentos / 15 min en login y registro.
- Consultas 100 % parametrizadas; los errores internos nunca llegan al cliente.
- `ON DELETE RESTRICT` en datos financieros: no se puede borrar un usuario con campañas o aportes.
- El servidor **no arranca** si falta `JWT_ACCESS_SECRET` o es débil (sin valores por defecto inseguros).

## 🚧 Siguientes pasos sugeridos

Pasarela de pagos real, correos transaccionales (aviso de cierre/reembolso), imágenes y video por campaña,
recompensas por nivel de aporte, edición/cancelación de campañas, y despliegue (variables de entorno,
`NODE_ENV=production`, HTTPS).
