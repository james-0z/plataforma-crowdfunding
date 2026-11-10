import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

type Source = 'body' | 'query' | 'params';

/** Valida y reemplaza req[source] con los datos ya limpios y tipados. */
export const validate =
  (source: Source, schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true });
    next();
  };
