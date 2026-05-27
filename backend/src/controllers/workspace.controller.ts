import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Workspace } from '../models/Workspace';
import { ApiResponse } from '../utils/ApiResponse';

export const getWorkspaceSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.clerkId;
  
  if (!userId) {
    res.status(401).json(new ApiResponse(401, 'Unauthorized'));
    return;
  }

  let workspace = await Workspace.findOne({ ownerId: userId });

  if (!workspace) {
    workspace = await Workspace.create({
      name: `${req.user?.name || 'Personal'} Workspace`,
      slug: `ws-${userId}`,
      ownerId: userId,
      members: [{ userId: userId, role: 'owner' }]
    });
  }

  res.status(200).json(new ApiResponse(200, 'Workspace retrieved successfully', workspace));
});

export const updateWorkspaceSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.clerkId;
  const { settings, aiConfig, integrations } = req.body;

  if (!userId) {
    res.status(401).json(new ApiResponse(401, 'Unauthorized'));
    return;
  }

  const workspace = await Workspace.findOne({ ownerId: userId });

  if (!workspace) {
    res.status(404).json(new ApiResponse(404, 'Workspace not found'));
    return;
  }

  if (settings) {
    workspace.settings = { ...workspace.settings, ...settings };
  }
  
  if (aiConfig) {
    workspace.aiConfig = { ...workspace.aiConfig, ...aiConfig };
  }

  if (integrations) {
    workspace.integrations = { ...workspace.integrations, ...integrations };
  }

  await workspace.save();

  res.status(200).json(new ApiResponse(200, 'Workspace settings updated successfully', workspace));
});
