/*
import express, { type Application } from 'express';
import cors from 'cors';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de comprobación de salud de la API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API Crowdfunding All-or-Nothing operacional' });
});

export default app;
*/

import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.route.js';
import campaignRoutes from './routes/compaign.route.js';
import contributionRoutes from './routes/contribution.route.js';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contributions', contributionRoutes);

// Ruta de comprobación de salud de la API
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'API Crowdfunding All-or-Nothing operacional' });
});

// Ruta de prueba de conexión a PostgreSQL
app.get('/api/db-check', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() AS fecha_actual, current_database() AS base_datos;');
    res.json({
      status: 'Éxito',
      mensaje: 'Conexión a PostgreSQL verificada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
    res.status(500).json({
      status: 'Error',
      mensaje: 'No se pudo conectar a la base de datos PostgreSQL',
      detalles: error instanceof Error ? error.message : String(error)
    });
  }
});

export default app;