import { Router } from 'express';
import { syncUser, getMe, updateProfile, getNotifications } from '../controllers/user.controller';
import { protect } from '../middleware/clerk.middleware';

const router = Router();

// Apply Clerk protection middleware to all user routes
router.use(protect);

router.post('/sync', syncUser);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);

export default router;
