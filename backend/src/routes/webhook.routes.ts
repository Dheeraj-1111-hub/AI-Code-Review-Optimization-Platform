import { Router } from 'express';
import { handleGithubWebhook } from '../webhooks/github.webhook';

const router = Router();

// Webhook endpoints do not use Clerk protection middleware because they are hit by GitHub directly
router.post('/github', handleGithubWebhook);

export default router;
