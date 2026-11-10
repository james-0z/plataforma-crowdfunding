import type { Request, Response } from 'express';
import { settleExpiredCampaigns } from '../services/settlement.service.js';

export const adminController = {
  /** Fuerza el cierre inmediato de las campañas vencidas (útil para demos y soporte). */
  async settle(_req: Request, res: Response) {
    res.json(await settleExpiredCampaigns());
  },
};
