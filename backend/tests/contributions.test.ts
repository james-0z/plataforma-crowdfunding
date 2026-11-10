import { beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/config/db.js';
import { createTestDatabase } from './helpers/testDb.js';
import { app, createCampaign, request, signUp } from './helpers/api.js';

let db: Database;
beforeAll(async () => {
  db = await createTestDatabase();
});

const pledge = (u: { auth: Record<string, string> }, campanaId: number, monto: unknown) =>
  request(app).post('/api/contributions').set(u.auth).send({ campanaId, monto });

describe('Aportes', () => {
  it('exige sesión (401)', async () => {
    expect((await request(app).post('/api/contributions').send({ campanaId: 1, monto: 10000 })).status).toBe(401);
  });

  it('suma el aporte, actualiza la campaña y cuenta aportantes únicos', async () => {
    const owner = await signUp();
    const a = await signUp();
    const b = await signUp();
    const c = await createCampaign(owner, { metaMonto: 1000000 });

    expect((await pledge(a, c.id, 100000)).status).toBe(201);
    expect((await pledge(a, c.id, 50000)).status).toBe(201);
    const last = await pledge(b, c.id, 1000);
    expect(last.status).toBe(201);

    // 100.25 + 50 + 1.10 = 151.35 exacto (sumado en SQL NUMERIC, sin errores de punto flotante)
    expect(last.body.campaign.montoRecaudado).toBe(151000);
    expect(last.body.campaign.totalAportantes).toBe(2);
  });

  it.each([
    ['texto "abc" (antes dejaba la campaña en NaN)', 'abc'],
    ['cero', 0],
    ['negativo', -10],
    ['menor al mínimo', 500],
    ['decimal', 1500.5],
    ['astronómico', 1e12],
    ['nulo', null],
  ])('rechaza monto inválido: %s', async (_l, monto) => {
    const owner = await signUp();
    const a = await signUp();
    const c = await createCampaign(owner);
    expect((await pledge(a, c.id, monto)).status).toBe(400);
    const after = await request(app).get(`/api/campaigns/${c.id}`);
    expect(after.body.montoRecaudado).toBe(0); // la campaña quedó intacta
  });

  it('el creador no puede aportar a su propia campaña (403)', async () => {
    const owner = await signUp();
    const c = await createCampaign(owner);
    const res = await pledge(owner, c.id, 100);
    expect(res.status).toBe(403);
  });

  it('campaña inexistente: 404', async () => {
    const a = await signUp();
    expect((await pledge(a, 999999, 10)).status).toBe(404);
  });

  it('no acepta aportes después de la fecha límite (409)', async () => {
    const owner = await signUp();
    const a = await signUp();
    const c = await createCampaign(owner);
    await db.query("UPDATE campanas SET fecha_limite = '2020-01-01' WHERE id = $1", [c.id]);
    const res = await pledge(a, c.id, 10);
    expect(res.status).toBe(409);
  });

  it('al alcanzar la meta sigue ACTIVA y admite sobrefinanciación', async () => {
    const owner = await signUp();
    const a = await signUp();
    const c = await createCampaign(owner, { metaMonto: 100 });
    const r1 = await pledge(a, c.id, 100);
    expect(r1.body.campaign.estado).toBe('activa');
    const r2 = await pledge(a, c.id, 50);
    expect(r2.status).toBe(201);
    expect(r2.body.campaign.montoRecaudado).toBe(150);
  });

  it('dos aportes simultáneos no pierden dinero', async () => {
    const owner = await signUp();
    const a = await signUp();
    const b = await signUp();
    const c = await createCampaign(owner);
    await Promise.all([pledge(a, c.id, 10), pledge(b, c.id, 20), pledge(a, c.id, 30)]);
    const after = await request(app).get(`/api/campaigns/${c.id}`);
    expect(after.body.montoRecaudado).toBe(60);
  });

  it('/contributions/mine lista solo los aportes del usuario con el estado de la campaña', async () => {
    const owner = await signUp();
    const a = await signUp();
    const b = await signUp();
    const c = await createCampaign(owner, { titulo: 'Mi campaña visible' });
    await pledge(a, c.id, 40);
    await pledge(b, c.id, 60);
    const mine = await request(app).get('/api/contributions/mine').set(a.auth);
    expect(mine.body.items).toHaveLength(1);
    expect(mine.body.items[0]).toMatchObject({
      campanaTitulo: 'Mi campaña visible',
      monto: 40,
      reembolsado: false,
      estadoCampana: 'activa',
    });
  });
});
