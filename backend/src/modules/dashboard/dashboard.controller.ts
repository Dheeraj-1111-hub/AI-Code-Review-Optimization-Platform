import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { Workspace } from '../../models/Workspace';

export class DashboardController {
  static async getOverview(req: Request, res: Response) {
    try {
      // Support both URL param and query param for flexibility
      let workspaceId = (req.params.workspaceId || req.query.workspaceId) as string;

      // If still no workspaceId, look up the workspace owned by the authenticated user
      if (!workspaceId || workspaceId === '664c1234567890abcdef1234') {
        const clerkId = req.user?.clerkId;
        if (!clerkId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const workspace = await Workspace.findOne({ ownerId: clerkId });
        if (!workspace) {
          return res.status(404).json({ error: 'No workspace found for this user' });
        }
        workspaceId = workspace._id.toString();
      }

      const data = await DashboardService.getOverview(workspaceId);
      res.json(data);
    } catch (error: unknown) {
      console.error('Failed to get dashboard overview:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: message });
    }
  }
}
