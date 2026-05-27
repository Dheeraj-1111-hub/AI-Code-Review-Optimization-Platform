import { Router } from 'express';
import { startReview, getReview, getMyReviews, deleteReview, rerunReview } from '../controllers/review.controller';
import { protect } from '../middleware/clerk.middleware';

const router = Router();

// Apply auth protection to all review routes
router.use(protect);

router.post('/start', startReview);
router.get('/', getMyReviews);
router.get('/:id', getReview);
router.delete('/:id', deleteReview);
router.post('/:id/rerun', rerunReview);

export default router;
