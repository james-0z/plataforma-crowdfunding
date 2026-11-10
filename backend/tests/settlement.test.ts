import { beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/config/db.js';
import { settleExpiredCampaigns } from '../src/services/settlement.service.js';
import { createTestDatabase } from './helpers/testDb.js';
import { app, createCampaign, makeAdmin, request, signUp } from './helpers/api.js';

let db: Database;
beforeAll(async () => {
  db = await createTestDatabase();
});

const pledge = (u: { auth: Record<string, string> }, campanaId: number, monto: number) =>
  request(app).post('/api/contributions').set(u.auth).send({ campanaId, monto });
const expire = (id: number) => db.query("UPDATE campanas SET fecha_limite = '2020-01-01' WHERE id = $1", [id]);
const getCampaign = async (id: number) => (await request(app).get(`/api/campaigns/${id}`)).body;

describe('Cierre All-or-Nothing', () => {
  it('campaña vencida que alcanzó la meta pasa a EXITOSA y no reembolsa nada', async () => {
    const owner = await signUp();
    const a = await signUp();
    const c = await createCampaign(owner, { metaMonto: 100000 });
    await pledge(a, c.id, 100000);
    await expire(c.id);

    const r = await settleExpiredCampaigns();
    expect(r.exitosas).toBeGreaterThanOrEqual(1);

    const after = await getCampaign(c.id);
    expect(after.estado).toBe('exitosa');
    expect(after.cerradoEn).toBeTruthy();
    const mine = await request(app).get('/api/contributions/mine').set(a.auth);
    expect(mine.body.items[0].reembolsado).toBe(false);
  });

  it('campaña vencida que NO alcanzó la meta pasa a FALLIDA y reembolsa todos los aportes', async () => {
    const owner = await signUp();
    const a = await signUp();
    const b = await signUp();
    const c = await createCampaign(owner, { metaMonto: 1000000 });
    await pledge(a, c.id, 100000);
    await pledge(a, c.id, 50000);
    await pledge(b, c.id, 25000);
    await expire(c.id);

    const r = await settleExpiredCampaigns();
    expect(r).toMatchObject({ fallidas: 1, aportesReembolsados: 3, montoReembolsado: 175000 });

    expect((await getCampaign(c.id)).estado).toBe('fallida');
    const mine = await request(app).get('/api/contributions/mine').set(a.auth);
    expect(mine.body.items).toHaveLength(2);
    expect(mine.body.items.every((x: any) => x.reembolsado === true && x.reembolsadoEn)).toBe(true);
    expect(mine.body.items[0].estadoCampana).toBe('fallida');
  });

  it('es idempotente: ejecutarlo dos veces no reembolsa dos veces', async () => {
    const owner = await signUp();
    const a = await signUp();
    const c = await createCampaign(owner, { metaMonto: 1000000 });
    await pledge(a, c.id, 10000);
    await expire(c.id);

    const first = await settleExpiredCampaigns();
    const second = await settleExpiredCampaigns();
    expect(first.aportesReembolsados).toBe(1);
    expect(second.procesadas).toBe(0);
    expect(second.aportesReembolsados).toBe(0);
  });

  it('no toca campañas que aún no vencen', async () => {
    const owner = await signUp();
    const c = await createCampaign(owner);
    await settleExpiredCampaigns();
    expect((await getCampaign(c.id)).estado).toBe('activa');
  });

  it('una campaña vencida sin aportes pasa a fallida sin reembolsos', async () => {
    const owner = await signUp();
    const c = await createCampaign(owner);
    await expire(c.id);
    const r = await settleExpiredCampaigns();
    expect(r.fallidas).toBeGreaterThanOrEqual(1);
    expect((await getCampaign(c.id)).estado).toBe('fallida');
  });

  it('POST /admin/settle: solo admin (401 sin sesión, 403 usuario común, 200 admin)', async () => {
    const user = await signUp();
    expect((await request(app).post('/api/admin/settle')).status).toBe(401);
    expect((await request(app).post('/api/admin/settle').set(user.auth)).status).toBe(403);

    const admin = await signUp('Admin');
    await makeAdmin(db, admin.id);
    // el rol viaja en el token: hay que iniciar sesión de nuevo tras el cambio
    const login = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'Clave1234' });
    const res = await request(app).post('/api/admin/settle').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('procesadas');
  });
});
