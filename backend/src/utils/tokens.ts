import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Role } from '../models/user.model.js';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  rol: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign({ email: payload.email, rol: payload.rol }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    subject: String(payload.sub),
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || !decoded.sub) throw new Error('Token mal formado');
  return { sub: Number(decoded.sub), email: decoded['email'], rol: decoded['rol'] };
}

/** Token opaco aleatorio. Solo se guarda su hash SHA-256 en la BD. */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
