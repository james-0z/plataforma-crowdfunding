import { Router } from 'express';
import { contributionController } from '../controllers/contribution.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createContributionSchema } from '../validators/contribution.schema.js';

const router = Router();

router.get('/mine', authenticate, asyncHandler(contributionController.mine));
router.post('/', authenticate, validate('body', createContributionSchema), asyncHandler(contributionController.create));

export default router;
