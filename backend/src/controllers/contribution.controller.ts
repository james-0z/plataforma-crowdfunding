import { type Response } from 'express';
import { contributionService } from '../services/contribution.service.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const contributionController = {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { campanaId, monto } = req.body;
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
      }

      if (!campanaId || !monto) {
        res.status(400).json({ error: 'El ID de la campaña y el monto son obligatorios.' });
        return;
      }

      const result = await contributionService.create({
        campanaId: Number(campanaId),
        usuarioId,
        monto: Number(monto)
      });

      res.status(201).json({
        message: '¡Aporte registrado exitosamente!',
        ...result
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Error al registrar el aporte'
      });
    }
  }
};