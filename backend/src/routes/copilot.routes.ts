import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import { chat, getHistory, getMessages } from '../controllers/copilot.controller';

const router = Router();

router.use(protect);

router.post('/chat', chat);
router.get('/history', getHistory);
router.get('/history/:id', getMessages);

export default router;
