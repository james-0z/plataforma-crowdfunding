import { beforeAll, describe, expect, it } from 'vitest';
import { createTestDatabase } from './helpers/testDb.js';
import { app, cookieOf, request, signUp } from './helpers/api.js';

beforeAll(async () => {
  await createTestDatabase();
});

describe('Autenticación', () => {
  it('registra, devuelve token y deja el refresh token solo en cookie HttpOnly', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Ana', email: 'ANA@Test.com ', password: 'Clave1234' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('ana@test.com'); // normalizado
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined(); // no viaja en el JSON
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('refresh_token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('rechaza correo duplicado sin importar mayúsculas (409)', async () => {
    await request(app).post('/api/auth/register').send({ nombre: 'Bea', email: 'bea@test.com', password: 'Clave1234' });
    const dup = await request(app).post('/api/auth/register').send({ nombre: 'Bea 2', email: 'BEA@test.com', password: 'Clave1234' });
    expect(dup.status).toBe(409);
  });

  it.each([
    ['contraseña corta', { password: 'a1' }],
    ['sin números', { password: 'sololetras' }],
    ['correo inválido', { email: 'no-es-correo' }],
    ['nombre vacío', { nombre: ' ' }],
  ])('valida el registro: %s (400)', async (_label, override) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Test', email: 'x@test.com', password: 'Clave1234', ...override });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('login correcto e incorrecto con el mismo mensaje genérico', async () => {
    const u = await signUp();
    const ok = await request(app).post('/api/auth/login').send({ email: u.email, password: 'Clave1234' });
    expect(ok.status).toBe(200);

    const badPass = await request(app).post('/api/auth/login').send({ email: u.email, password: 'otra-cosa1' });
    const noUser = await request(app).post('/api/auth/login').send({ email: 'nadie@test.com', password: 'Clave1234' });
    expect(badPass.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(badPass.body.error).toBe(noUser.body.error);
  });

  it('protege /me: 401 sin token, 401 con token falso, 200 con token válido', async () => {
    const u = await signUp();
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer falso')).status).toBe(401);
    const me = await request(app).get('/api/auth/me').set(u.auth);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(u.email);
  });

  it('rota el refresh token y revoca todas las sesiones si se reutiliza uno viejo', async () => {
    const u = await signUp();
    const c1 = u.refreshCookie;

    const rotated = await request(app).post('/api/auth/refresh').set('Cookie', c1);
    expect(rotated.status).toBe(200);
    const c2 = cookieOf(rotated);
    expect(c2).not.toBe(c1); // se emitió uno nuevo

    // Reutilizar el viejo (c1) delata un posible robo: 401 y se anula también c2.
    expect((await request(app).post('/api/auth/refresh').set('Cookie', c1)).status).toBe(401);
    expect((await request(app).post('/api/auth/refresh').set('Cookie', c2)).status).toBe(401);
  });

  it('logout revoca la sesión', async () => {
    const u = await signUp();
    expect((await u.agent.post('/api/auth/logout')).status).toBe(204);
    expect((await u.agent.post('/api/auth/refresh')).status).toBe(401);
  });

  it('refresh sin cookie responde 401', async () => {
    expect((await request(app).post('/api/auth/refresh')).status).toBe(401);
  });
});
