import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import { startPRSimulation, getPR, prWebhook, updatePRStatus } from '../controllers/pr.controller';

const router = Router();

router.post('/simulate', protect, startPRSimulation);
router.post('/webhook', prWebhook);
router.get('/:id', protect, getPR);
router.patch('/:id/status', protect, updatePRStatus);

export default router;
