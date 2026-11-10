import dotenv from 'dotenv';
import { z } from 'zod';

// Única llamada a dotenv en todo el proyecto.
dotenv.config({ quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('crowdfunding_db'),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  JWT_ACCESS_SECRET: z
    .string({ error: 'JWT_ACCESS_SECRET es obligatorio' })
    .min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres (usa: openssl rand -hex 32)'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7),

  APP_TIMEZONE: z.string().default('America/Bogota'),
  SETTLEMENT_INTERVAL_SECONDS: z.coerce.number().int().min(0).default(60),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuración de entorno inválida:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
