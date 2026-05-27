import { Router } from 'express';
import { apiLimiter } from '../middleware/rate-limit.middleware';
import { requestLogger } from '../middleware/request-logger.middleware';
import userRoutes from './user.routes';
import reviewRoutes from './review.routes';
import repositoryRoutes from './repository.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import prRoutes from './pr.routes';
import webhookRoutes from './webhook.routes';
import analyticsRoutes from './analytics.routes';
import apiKeyRoutes from './apiKey.routes';
import githubRoutes from './github.routes';
import copilotRoutes from './copilot.routes';
import workspaceRoutes from './workspace.routes';

const router = Router();

// Apply request logger + global rate limit to all API routes
router.use(requestLogger);
router.use(apiLimiter);

router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/pr', prRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/github', githubRoutes);
router.use('/copilot', copilotRoutes);
router.use('/workspaces', workspaceRoutes);

export default router;
