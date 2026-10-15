import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Endpoint de verificación de estado
app.get('/api/salud', (req: Request, res: Response) => {
  res.status(200).json({
    estado: 'ok',
    mensaje: 'Servidor de Plataforma de Crowdfunding activo',
    timestamp: new Date().toISOString()
  });
});

export default app;