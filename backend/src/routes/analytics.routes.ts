import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import { getLatestAnalytics, triggerAnalyticsGeneration } from '../controllers/analytics.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(protect);

router.get('/', asyncHandler(getLatestAnalytics));
router.post('/generate', asyncHandler(triggerAnalyticsGeneration));

export default router;
