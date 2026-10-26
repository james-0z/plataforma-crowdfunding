import { Router } from 'express';
import { contributionController } from '../controllers/contribution.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta protegida para realizar un aporte (requiere token JWT)
router.post('/', verifyToken, contributionController.create);

export default router;