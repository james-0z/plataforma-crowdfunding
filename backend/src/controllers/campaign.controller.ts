import type { Request, Response } from 'express';
import { campaignService } from '../services/campaign.service.js';
import { categoryService } from '../services/category.service.js';

export const campaignController = {
  async list(req: Request, res: Response) {
    res.json(await campaignService.list(req.query as any));
  },

  async getById(req: Request, res: Response) {
    res.json(await campaignService.findById(Number(req.params['id'])));
  },

  async mine(req: Request, res: Response) {
    res.json({ items: await campaignService.listByCreator(req.user!.id) });
  },

  async create(req: Request, res: Response) {
    const campaign = await campaignService.create(req.user!.id, req.body);
    res.status(201).json({ message: 'Campaña creada exitosamente.', campaign });
  },

  async categories(_req: Request, res: Response) {
    res.json({ items: await categoryService.list() });
  },
};
