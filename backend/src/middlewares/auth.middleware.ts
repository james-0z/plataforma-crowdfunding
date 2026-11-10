import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';
import type { Role } from '../models/user.model.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token no proporcionado.'));
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, email: payload.email, rol: payload.rol };
    next();
  } catch {
    // 401 (y no 403): el cliente debe renovar el token o volver a iniciar sesión.
    next(AppError.unauthorized('Token inválido o expirado.'));
  }
};

/** RBAC: exige que el usuario autenticado tenga alguno de los roles indicados. */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.rol)) return next(AppError.forbidden());
    next();
  };
