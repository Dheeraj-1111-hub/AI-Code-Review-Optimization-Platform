import { Request, Response, NextFunction } from 'express';
import { Workspace, Role } from '../../models/Workspace';

export const requireRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - Assuming clerkMiddleware populates req.auth
      const userId = req.auth?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 1. Get workspaceId from params, query, or body
      const workspaceId = req.params.workspaceId || req.query.workspaceId || req.body.workspaceId;
      
      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required for this operation.' });
      }

      // 2. Fetch workspace and verify membership
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      // If user is the owner, they bypass RBAC implicitly
      if (workspace.ownerId === userId) {
        return next();
      }

      // 3. Find user in members list
      const member = workspace.members.find(m => m.userId === userId);
      if (!member) {
        return res.status(403).json({ error: 'You are not a member of this workspace.' });
      }

      // 4. Verify role
      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ 
          error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` 
        });
      }

      // Passed RBAC
      next();
    } catch (error) {
      console.error('[RBAC Error]', error);
      res.status(500).json({ error: 'Internal Server Error during role validation' });
    }
  };
};
