import { Request, Response } from 'express';
import { getLiveAnalytics } from '../services/analytics.service';

export const getLatestAnalytics = async (req: Request, res: Response) => {
  try {
    // Determine workspace context if available
    const workspaceId = req.query.workspaceId as string | undefined;
    
    const data = await getLiveAnalytics(workspaceId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

export const triggerAnalyticsGeneration = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.body.workspaceId as string | undefined;
    const data = await getLiveAnalytics(workspaceId);
    
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error triggering analytics generation:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
};
