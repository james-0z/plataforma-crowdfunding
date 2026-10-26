import { type Response } from 'express';
import { campaignService } from '../services/compaign.service.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const campaignController = {
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categoriaId = req.query.categoria ? Number(req.query.categoria) : undefined;
      const campaigns = await campaignService.getAll(categoriaId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las campañas' });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const campaign = await campaignService.getById(id);
      res.json(campaign);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Error al buscar campaña' });
    }
  },

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { categoriaId, titulo, descripcion, metaMonto, fechaLimite } = req.body;
      const creadorId = req.user?.id;

      if (!creadorId) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
      }

      if (!titulo || !descripcion || !metaMonto || !fechaLimite) {
        res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
        return;
      }

      const newCampaign = await campaignService.create({
        creadorId,
        categoriaId: categoriaId || null,
        titulo,
        descripcion,
        metaMonto,
        fechaLimite
      });

      res.status(201).json({
        message: 'Campaña creada exitosamente',
        campaign: newCampaign
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Error al crear la campaña' });
    }
  }
};