import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import adminRoutes from './admin.route.js';
import authRoutes from './auth.route.js';
import campaignRoutes from './campaign.route.js';
import contributionRoutes from './contribution.route.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API Crowdfunding All-or-Nothing operacional' });
});
router.get('/categories', asyncHandler(campaignController.categories));
router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/contributions', contributionRoutes);
router.use('/admin', adminRoutes);

export default router;
