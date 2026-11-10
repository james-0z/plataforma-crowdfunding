import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { setDatabase, type Database, type Queryable } from '../../src/config/db.js';

const schema = readFileSync(new URL('../../src/database/schema.sql', import.meta.url), 'utf8');

/** Adapta PGlite (PostgreSQL embebido en WASM) a la interfaz Database de la app. */
export async function createTestDatabase(): Promise<Database> {
  const pg = new PGlite();
  await pg.exec(schema);

  const wrap = (q: { query: PGlite['query'] }): Queryable => ({
    async query(text, params) {
      const r = await q.query(text, params as any[]);
      return { rows: r.rows as any[], rowCount: r.affectedRows ?? r.rows.length };
    },
  });

  const database: Database = {
    ...wrap(pg),
    transaction: (fn) => pg.transaction((tx) => fn(wrap(tx as any))),
    close: () => pg.close(),
  };
  setDatabase(database);
  return database;
}
