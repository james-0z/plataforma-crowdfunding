# Plataforma de Crowdfunding (All-or-Nothing)

Sistema de financiamiento colectivo con liquidación automática o reembolso según cumplimiento de metas.

## Estándar Técnico
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (Arquitectura Limpia).
- **Frontend:** Vue 3, Vite, Pinia, TypeScript.
- **Seguridad:** Doble token (Access Token en memoria + Refresh Token en Cookie HttpOnly), RBAC, Hashing Argon2/BCrypt.