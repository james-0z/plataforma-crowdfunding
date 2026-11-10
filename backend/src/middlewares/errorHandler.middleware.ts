import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { isProduction, isTest } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }));
    res.status(400).json({
      error: details[0]?.mensaje ?? 'Datos inválidos.',
      code: 'VALIDATION_ERROR',
      details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
    return;
  }

  // JSON mal formado enviado por el cliente
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.', code: 'BAD_JSON' });
    return;
  }

  if (!isTest) console.error('❌ Error no controlado:', err);

  // Nunca se filtran mensajes internos ni stack traces al cliente.
  res.status(500).json({
    error: 'Error interno del servidor.',
    code: 'INTERNAL_ERROR',
    ...(isProduction ? {} : { debug: err?.message }),
  });
};
