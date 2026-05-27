import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import { validate } from '../middleware/validate.middleware';
import { createRepositorySchema } from '../validators/repository.validator';
import {
  getRepositories,
  getRepository,
  createRepository,
  deleteRepository,
  scanRepository,
} from '../controllers/repository.controller';
import { handleGitHubWebhook } from '../controllers/webhook.controller';

const router = Router();

// Public webhook route
router.post('/webhook', handleGitHubWebhook);

router.use(protect as any);

router.route('/').get(getRepositories).post(validate(createRepositorySchema), createRepository);

router.route('/:id').get(getRepository).delete(deleteRepository);

router.post('/:id/scan', scanRepository);

export default router;
