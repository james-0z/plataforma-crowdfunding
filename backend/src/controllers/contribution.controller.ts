import type { Request, Response } from 'express';
import { contributionService } from '../services/contribution.service.js';

export const contributionController = {
  async create(req: Request, res: Response) {
    const result = await contributionService.create(req.user!.id, req.body);
    res.status(201).json({ message: '¡Aporte registrado exitosamente!', ...result });
  },

  async mine(req: Request, res: Response) {
    res.json({ items: await contributionService.listByUser(req.user!.id) });
  },
};
