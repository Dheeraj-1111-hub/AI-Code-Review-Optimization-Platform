import { Request, Response, NextFunction } from 'express';
import { Workspace } from '../models/Workspace';

/**
 * Middleware to strictly enforce Role-Based Access Control (RBAC)
 * The user must have one of the `allowedRoles` within the active Workspace.
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.clerkId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const userId = req.user.clerkId;
      
      const workspace = await Workspace.findOne({ ownerId: userId });
      
      if (!workspace) {
        return res.status(403).json({ success: false, error: 'Workspace not found' });
      }

      // Since Team Space is removed, the user is always the owner of their workspace
      const userRole = 'owner';

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] but user has ${userRole}` 
        });
      }

      // Attach workspace to request for downstream controllers
      (req as any).workspace = workspace;
      (req as any).userRole = userRole;

      next();
    } catch (error) {
      console.error('RBAC Middleware Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error verifying permissions' });
    }
  };
};
