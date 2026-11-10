import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';

// Carpeta con el frontend compilado (se crea al desplegar: backend/public).
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

export function createApp(): Application {
  const app = express();

  // Detrás del proxy de la nube: necesario para ver la IP real del cliente
  // (límite de intentos de login) y para que las cookies seguras funcionen.
  app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use('/api', routes);
  app.use('/api', notFoundHandler); // una ruta /api desconocida responde JSON 404

  // Si existe el frontend compilado, el mismo servidor lo sirve.
  if (existsSync(join(publicDir, 'index.html'))) {
    app.use(
      express.static(publicDir, {
        index: false,
        setHeaders: (res, path) => {
          if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );
    // Cualquier otra ruta (/campanas/3, /dashboard…) la resuelve Vue Router.
    app.get('*', (_req, res) => {
      res.sendFile(join(publicDir, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
