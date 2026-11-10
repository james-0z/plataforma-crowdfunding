import request from 'supertest';
import { createApp } from '../../src/app.js';
import type { Database } from '../../src/config/db.js';
import { addDays, todayInTz } from '../../src/utils/dates.js';

export const app = createApp();
export const today = () => todayInTz();
export const inDays = (n: number) => addDays(todayInTz(), n);

let counter = 0;

/** Extrae "refresh_token=valor" de la cabecera Set-Cookie de una respuesta. */
export function cookieOf(res: { headers: Record<string, unknown> }): string {
  const raw = res.headers['set-cookie'] as string[] | string | undefined;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.find((c) => c.startsWith('refresh_token='))?.split(';')[0] ?? '';
}

/** Registra un usuario y devuelve su agente (con cookie) y su token. */
export async function signUp(name = 'Usuario Prueba') {
  counter++;
  const agent = request.agent(app);
  const email = `user${counter}_${Date.now()}@test.com`;
  const res = await agent.post('/api/auth/register').send({ nombre: name, email, password: 'Clave1234' });
  if (res.status !== 201) throw new Error(`No se pudo registrar: ${res.status} ${JSON.stringify(res.body)}`);
  const refreshCookie = cookieOf(res);
  return {
    agent,
    email,
    refreshCookie,
    id: res.body.user.id as number,
    token: res.body.accessToken as string,
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}

export async function makeAdmin(db: Database, userId: number) {
  await db.query("UPDATE usuarios SET rol = 'admin' WHERE id = $1", [userId]);
}

export const validCampaign = (over: Record<string, unknown> = {}) => ({
  categoriaId: 1,
  titulo: 'Campaña de prueba',
  descripcion: 'Una descripción suficientemente larga para pasar la validación.',
  metaMonto: 1000000,
  fechaLimite: inDays(10),
  ...over,
});

export async function createCampaign(owner: { auth: Record<string, string> }, over: Record<string, unknown> = {}) {
  const res = await request(app).post('/api/campaigns').set(owner.auth).send(validCampaign(over));
  if (res.status !== 201) throw new Error(`No se pudo crear campaña: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.campaign as { id: number };
}

export { request };
