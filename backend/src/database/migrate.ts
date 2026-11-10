import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../config/db.js';
import { env } from '../config/env.js';

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const reset = process.argv.includes('--reset');

try {
  if (reset) {
    if (env.NODE_ENV === 'production') throw new Error('--reset está prohibido en producción.');
    await db.query('DROP TABLE IF EXISTS refresh_tokens, aportes, campanas, categorias, usuarios CASCADE');
    console.log('🗑️  Tablas eliminadas.');
  }
  await db.query(readFileSync(schemaPath, 'utf8'));
  console.log('✅ Esquema aplicado correctamente.');
} catch (error) {
  console.error('❌ No se pudo aplicar el esquema:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.close();
}
