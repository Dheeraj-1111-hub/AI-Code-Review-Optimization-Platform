import { Router } from 'express';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../controllers/workspace.controller';
import { protect } from '../middleware/clerk.middleware';

const router = Router();

router.use(protect);

router.get('/settings', getWorkspaceSettings);
router.put('/settings', updateWorkspaceSettings);

export default router;
