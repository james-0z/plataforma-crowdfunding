import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/settle', authenticate, requireRole('admin'), asyncHandler(adminController.settle));

export default router;
