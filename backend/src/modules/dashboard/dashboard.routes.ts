import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { protect } from '../../middleware/clerk.middleware';

const router = Router();

router.get('/overview/:workspaceId', protect, DashboardController.getOverview);

export default router;
