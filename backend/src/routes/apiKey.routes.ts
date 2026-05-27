import { Router } from 'express';
import { protect } from '../middleware/clerk.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { generateAPIKey, listAPIKeys, revokeAPIKey } from '../controllers/apiKey.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Apply Clerk protection middleware to all API Key routes
router.use(protect);

// Require Admin or Owner role for API Key management
router.use(requireRole(['admin', 'owner']));

router.get('/', asyncHandler(listAPIKeys));
router.post('/', asyncHandler(generateAPIKey));
router.delete('/:id', asyncHandler(revokeAPIKey));

export default router;
