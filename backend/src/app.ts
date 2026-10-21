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