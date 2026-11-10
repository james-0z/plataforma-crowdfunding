import pg from 'pg';
import { env, isTest } from './env.js';

/**
 * Capa mínima de acceso a datos. Los servicios solo conocen estas interfaces,
 * por eso los tests pueden sustituir PostgreSQL por una BD embebida (PGlite).
 */
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface Queryable {
  query<T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

function createPgDatabase(): Database {
  const pool = new pg.Pool(
    env.DATABASE_URL
      ? { connectionString: env.DATABASE_URL, max: env.DB_POOL_MAX }
      : {
          host: env.DB_HOST,
          port: env.DB_PORT,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
          max: env.DB_POOL_MAX,
        },
  );

  // Un error en un cliente inactivo no debe tumbar el servidor.
  pool.on('error', (err) => console.error('Error en cliente inactivo de PostgreSQL:', err.message));

  return {
    async query(text, params) {
      const r = await pool.query(text, params as any[]);
      return { rows: r.rows, rowCount: r.rowCount ?? 0 };
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const tx: Queryable = {
          async query(text, params) {
            const r = await client.query(text, params as any[]);
            return { rows: r.rows, rowCount: r.rowCount ?? 0 };
          },
        };
        const result = await fn(tx);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

// En test no se abre ninguna conexión real: el test inyecta su propia BD.
let current: Database | null = isTest ? null : createPgDatabase();

export function setDatabase(database: Database): void {
  current = database;
}

function getCurrent(): Database {
  if (!current) throw new Error('Base de datos no inicializada');
  return current;
}

export const db: Database = {
  query: (text, params) => getCurrent().query(text, params),
  transaction: (fn) => getCurrent().transaction(fn),
  close: () => (current ? current.close() : Promise.resolve()),
};
