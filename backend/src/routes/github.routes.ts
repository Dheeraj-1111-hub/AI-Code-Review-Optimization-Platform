import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import {
  initiateGitHubOAuth,
  handleGitHubCallback,
  disconnectGitHub,
  getGitHubStatus,
} from '../controllers/github.controller';

const router = Router();

// Initiate GitHub OAuth — user clicks "Connect", this redirects them to GitHub
router.get('/connect', protect, initiateGitHubOAuth);

// GitHub calls this after the user authorizes — no `protect` needed, GitHub hits this directly
router.get('/callback', handleGitHubCallback);

// Disconnect GitHub
router.delete('/disconnect', protect, disconnectGitHub);

// Get live GitHub connection status
router.get('/status', protect, getGitHubStatus);

export default router;
