import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.js';
import { authController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';

const router = Router();

// Freno a la fuerza bruta: 10 intentos por IP cada 15 minutos.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.', code: 'RATE_LIMITED' },
});

router.post('/register', authLimiter, validate('body', registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate('body', loginSchema), asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
