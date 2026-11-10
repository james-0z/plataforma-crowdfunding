import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.schema.js';
import { createCampaignSchema, listCampaignsQuerySchema } from '../validators/campaign.schema.js';

const router = Router();

router.get('/', validate('query', listCampaignsQuerySchema), asyncHandler(campaignController.list));
// '/mine' debe ir ANTES de '/:id' o Express lo interpretaría como un id.
router.get('/mine', authenticate, asyncHandler(campaignController.mine));
router.get('/:id', validate('params', idParamSchema), asyncHandler(campaignController.getById));
router.post('/', authenticate, validate('body', createCampaignSchema), asyncHandler(campaignController.create));

export default router;
