import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { addDays, todayInTz } from '../utils/dates.js';
import { hashPassword } from '../utils/hash.js';

/**
 * Datos de demostración. Incluye campañas ya vencidas (una que alcanzó su meta y otra que no)
 * para poder mostrar el cierre automático: basta con entrar como admin y pulsar "Procesar cierres".
 */
if (env.NODE_ENV === 'production') {
  console.error('❌ El seed no se puede ejecutar en producción.');
  process.exit(1);
}

const DEMO_PASSWORD = 'Demo1234';
const today = todayInTz();

try {
  const hash = await hashPassword(DEMO_PASSWORD);
  const upsertUser = async (nombre: string, email: string, rol: 'user' | 'admin') => {
    const r = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)
       ON CONFLICT (LOWER(email)) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id`,
      [nombre, email, hash, rol],
    );
    return r.rows[0].id as number;
  };

  const admin = await upsertUser('Administrador', 'admin@crowdfund.test', 'admin');
  const ana = await upsertUser('Ana Gómez', 'ana@crowdfund.test', 'user');
  const luis = await upsertUser('Luis Pérez', 'luis@crowdfund.test', 'user');
  const sofia = await upsertUser('Sofía Ramírez', 'sofia@crowdfund.test', 'user');

  const exists = await db.query('SELECT 1 FROM campanas LIMIT 1');
  if (exists.rows.length > 0) {
    console.log('ℹ️  Ya existen campañas; se conservan. Usa "npm run db:reset" para empezar de cero.');
  } else {
    const cat = async (slug: string) => (await db.query('SELECT id FROM categorias WHERE slug = $1', [slug])).rows[0].id;
    const campaign = async (creador: number, categoria: string, titulo: string, descripcion: string, meta: number, dias: number) =>
      (
        await db.query(
          `INSERT INTO campanas (creador_id, categoria_id, titulo, descripcion, meta_monto, fecha_limite)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [creador, await cat(categoria), titulo, descripcion, meta, addDays(today, dias)],
        )
      ).rows[0].id as number;
    const pledge = async (campana: number, usuario: number, monto: number) => {
      await db.query('INSERT INTO aportes (campana_id, usuario_id, monto) VALUES ($1, $2, $3)', [campana, usuario, monto]);
      await db.query('UPDATE campanas SET monto_recaudado = monto_recaudado + $1 WHERE id = $2', [monto, campana]);
    };

    const rpg = await campaign(ana, 'videojuegos', 'Videojuego Indie RPG 2D',
      'Un juego de rol con estética retro de 16 bits, banda sonora orquestal grabada en vivo y más de 30 horas de aventura.', 5000000, 20);
    await pledge(rpg, luis, 1500000); await pledge(rpg, sofia, 2000000);

    const teclado = await campaign(luis, 'tecnologia', 'Teclado Mecánico Ergonómico Custom',
      'Teclado modular con switches intercambiables en caliente y cuerpo de aluminio anodizado, diseñado para largas jornadas.', 3000000, 12);
    await pledge(teclado, ana, 3400000);

    await campaign(sofia, 'arte-cine', 'Documental sobre los ríos de Cali',
      'Registro audiovisual sobre la conservación de especies nativas en los ríos de la ciudad, con entrevistas a comunidades locales.', 4000000, 35);

    // Campañas vencidas, sin liquidar: sirven para demostrar el cierre y el reembolso.
    const ok = await campaign(ana, 'diseno-hardware', 'Lámpara modular impresa en 3D',
      'Lámpara de escritorio modular, impresa en 3D con material reciclado, con piezas intercambiables de colores.', 1000000, -3);
    await pledge(ok, luis, 700000); await pledge(ok, sofia, 500000);

    const ko = await campaign(luis, 'arte-cine', 'Cortometraje de animación "Aurora"',
      'Cortometraje de animación 2D de 10 minutos sobre una niña que descubre un faro mágico en la costa pacífica.', 8000000, -2);
    await pledge(ko, ana, 400000); await pledge(ko, sofia, 250000);

    console.log('✅ Datos de demostración creados.');
  }

  console.log('\nUsuarios demo (contraseña: ' + DEMO_PASSWORD + '):');
  console.log('  admin@crowdfund.test  (administrador)');
  console.log('  ana@crowdfund.test | luis@crowdfund.test | sofia@crowdfund.test');
  void admin;
} catch (error) {
  console.error('❌ Error en el seed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.close();
}
