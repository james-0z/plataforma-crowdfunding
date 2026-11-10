import { db, type Queryable } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import type { User } from '../models/user.model.js';
import type { LoginInput, RegisterInput } from '../validators/auth.schema.js';
import { comparePassword, DUMMY_HASH, hashPassword } from '../utils/hash.js';
import { mapUser } from '../utils/mappers.js';
import { generateRefreshToken, hashToken, signAccessToken } from '../utils/tokens.js';

export interface Session {
  user: User;
  accessToken: string;
  /** Token opaco para la cookie HttpOnly. Nunca viaja en el cuerpo JSON. */
  refreshToken: string;
}

const USER_COLUMNS = 'id, nombre, email, rol, creado_en';

async function createSession(tx: Queryable, user: User): Promise<Session> {
  const refreshToken = generateRefreshToken();
  await tx.query(
    `INSERT INTO refresh_tokens (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, NOW() + ($3 || ' days')::interval)`,
    [user.id, hashToken(refreshToken), String(env.REFRESH_TOKEN_DAYS)],
  );
  const accessToken = signAccessToken({ sub: user.id, email: user.email, rol: user.rol });
  return { user, accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<Session> {
    const passwordHash = await hashPassword(input.password);
    try {
      return await db.transaction(async (tx) => {
        const result = await tx.query(
          `INSERT INTO usuarios (nombre, email, password_hash)
           VALUES ($1, $2, $3) RETURNING ${USER_COLUMNS}`,
          [input.nombre, input.email, passwordHash],
        );
        return createSession(tx, mapUser(result.rows[0]));
      });
    } catch (error: any) {
      // 23505 = unique_violation: el índice único evita la condición de carrera.
      if (error?.code === '23505') throw AppError.conflict('El correo electrónico ya está registrado.');
      throw error;
    }
  },

  async login(input: LoginInput): Promise<Session> {
    const result = await db.query(`SELECT ${USER_COLUMNS}, password_hash FROM usuarios WHERE LOWER(email) = $1`, [
      input.email,
    ]);
    const row = result.rows[0];

    // Se compara siempre contra un hash para que el tiempo no delate si el correo existe.
    const valid = await comparePassword(input.password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !valid) throw AppError.unauthorized('Credenciales inválidas.');

    return db.transaction((tx) => createSession(tx, mapUser(row)));
  },

  /**
   * Rotación de refresh tokens: cada uso emite uno nuevo y revoca el anterior.
   * Si llega un token ya revocado (posible robo), se revocan TODAS las sesiones del usuario.
   */
  async refresh(rawToken: string | undefined): Promise<Session> {
    if (!rawToken) throw AppError.unauthorized('Sesión no encontrada.');
    const tokenHash = hashToken(rawToken);

    const outcome = await db.transaction(async (tx) => {
      const found = await tx.query(
        `SELECT id, usuario_id, revocado, (expira_en < NOW()) AS expirado
         FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE`,
        [tokenHash],
      );
      const token = found.rows[0];
      if (!token) return { kind: 'invalid' as const };

      if (token.revocado) {
        await tx.query('UPDATE refresh_tokens SET revocado = TRUE WHERE usuario_id = $1', [token.usuario_id]);
        return { kind: 'reuse' as const };
      }
      if (token.expirado) return { kind: 'invalid' as const };

      await tx.query('UPDATE refresh_tokens SET revocado = TRUE WHERE id = $1', [token.id]);
      const user = await tx.query(`SELECT ${USER_COLUMNS} FROM usuarios WHERE id = $1`, [token.usuario_id]);
      if (!user.rows[0]) return { kind: 'invalid' as const };
      return { kind: 'ok' as const, session: await createSession(tx, mapUser(user.rows[0])) };
    });

    if (outcome.kind !== 'ok') throw AppError.unauthorized('Sesión inválida o expirada.');
    return outcome.session;
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await db.query('UPDATE refresh_tokens SET revocado = TRUE WHERE token_hash = $1', [hashToken(rawToken)]);
  },

  async me(userId: number): Promise<User> {
    const result = await db.query(`SELECT ${USER_COLUMNS} FROM usuarios WHERE id = $1`, [userId]);
    if (!result.rows[0]) throw AppError.unauthorized('El usuario ya no existe.');
    return mapUser(result.rows[0]);
  },
};
