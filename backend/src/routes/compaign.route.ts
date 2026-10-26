import { Router } from 'express';
import { campaignController } from '../controllers/compaign.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas
router.get('/', campaignController.getAll);
router.get('/:id', campaignController.getById);

// Ruta protegida (requiere JWT)
router.post('/', verifyToken, campaignController.create);

export default router;