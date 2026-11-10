import { beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '../src/config/db.js';
import { createTestDatabase } from './helpers/testDb.js';
import { app, createCampaign, inDays, request, signUp, validCampaign } from './helpers/api.js';

let db: Database;
beforeAll(async () => {
  db = await createTestDatabase();
});

describe('Campañas', () => {
  it('lista categorías y campañas públicas sin autenticación', async () => {
    const cats = await request(app).get('/api/categories');
    expect(cats.status).toBe(200);
    expect(cats.body.items.map((c: any) => c.slug)).toContain('videojuegos');
    expect((await request(app).get('/api/campaigns')).status).toBe(200);
  });

  it('crear campaña exige sesión (401)', async () => {
    expect((await request(app).post('/api/campaigns').send(validCampaign())).status).toBe(401);
  });

  it('crea una campaña y la devuelve en camelCase con datos coherentes', async () => {
    const owner = await signUp('Dueña');
    const res = await request(app).post('/api/campaigns').set(owner.auth).send(validCampaign({ metaMonto: 25000 }));
    expect(res.status).toBe(201);
    const c = res.body.campaign;
    expect(c).toMatchObject({
      estado: 'activa',
      metaMonto: 25000,
      montoRecaudado: 0,
      creadorNombre: 'Dueña',
      categoriaSlug: 'tecnologia',
      totalAportantes: 0,
    });
    expect(c.fechaLimite).toBe(inDays(10)); // sin desfases de zona horaria
    expect(c.diasRestantes).toBe(10);
  });

  it.each([
    ['fecha pasada', { fechaLimite: '2020-01-01' }, 400],
    ['fecha de hoy', { fechaLimite: inDays(0) }, 400],
    ['fecha inexistente', { fechaLimite: '2026-02-31' }, 400],
    ['más de 60 días', { fechaLimite: inDays(61) }, 400],
    ['meta negativa', { metaMonto: -5 }, 400],
    ['meta menor al mínimo', { metaMonto: 5 }, 400],
    ['meta como texto', { metaMonto: 'abc' }, 400],
    ['meta con 3 decimales', { metaMonto: 100.123 }, 400],
    ['meta enorme', { metaMonto: 99999999999 }, 400],
    ['título muy corto', { titulo: 'ab' }, 400],
    ['título muy largo', { titulo: 'x'.repeat(151) }, 400],
    ['categoría inexistente', { categoriaId: 999 }, 400],
  ])('rechaza: %s', async (_l, over, status) => {
    const owner = await signUp();
    const res = await request(app).post('/api/campaigns').set(owner.auth).send(validCampaign(over));
    expect(res.status).toBe(status);
  });

  it('filtra por categoría y por texto (incluyendo comodines literales)', async () => {
    const owner = await signUp();
    await createCampaign(owner, { categoriaId: 2, titulo: 'Juego 100% original' });
    await createCampaign(owner, { categoriaId: 3, titulo: 'Documental sobre ríos' });

    const games = await request(app).get('/api/campaigns?categoria=videojuegos');
    expect(games.body.items.every((c: any) => c.categoriaSlug === 'videojuegos')).toBe(true);

    const q = await request(app).get('/api/campaigns').query({ q: '100%' });
    expect(q.body.items.map((c: any) => c.titulo)).toEqual(['Juego 100% original']);

    expect((await request(app).get('/api/campaigns?pageSize=999')).status).toBe(400);
  });

  it('GET /campaigns/:id: 200, 404 y 400 con id inválido', async () => {
    const owner = await signUp();
    const c = await createCampaign(owner);
    expect((await request(app).get(`/api/campaigns/${c.id}`)).status).toBe(200);
    expect((await request(app).get('/api/campaigns/999999')).status).toBe(404);
    expect((await request(app).get('/api/campaigns/abc')).status).toBe(400);
  });

  it('/campaigns/mine devuelve solo las campañas del usuario', async () => {
    const a = await signUp('Usuario A');
    const b = await signUp('Usuario B');
    await createCampaign(a);
    await createCampaign(a);
    await createCampaign(b);
    const mine = await request(app).get('/api/campaigns/mine').set(a.auth);
    expect(mine.status).toBe(200);
    expect(mine.body.items).toHaveLength(2);
    expect(mine.body.items.every((c: any) => c.creadorId === a.id)).toBe(true);
  });

  it('no expone detalles internos en errores 500 ni 404 de ruta', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain('stack');
  });

  it('la BD impide borrar usuarios con campañas o aportes (sin CASCADE)', async () => {
    const owner = await signUp();
    await createCampaign(owner);
    await expect(db.query('DELETE FROM usuarios WHERE id = $1', [owner.id])).rejects.toThrow();
  });
});
