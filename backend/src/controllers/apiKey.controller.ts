import { Request, Response } from 'express';
import { Workspace } from '../models/Workspace';
import APIKey from '../models/APIKey';
import crypto from 'crypto';
import { AuditLog } from '../models/AuditLog';

const generateRandomKey = () => crypto.randomBytes(24).toString('hex');
const hashKey = (key: string) => crypto.createHash('sha256').update(key).digest('hex');

export const generateAPIKey = async (req: Request, res: Response) => {
  try {
    const workspace = (req as any).workspace || await Workspace.findOne({ ownerId: req.user!.clerkId });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'API Key name is required' });

    const rawKeyPart = generateRandomKey();
    const rawKey = `dvls_sk_${rawKeyPart}`;
    const hashedKey = hashKey(rawKey);
    const keyPrefix = `dvls_sk_${rawKeyPart.substring(0, 8)}`;

    const apiKey = await APIKey.create({
      workspaceId: workspace._id,
      userId: req.user!.clerkId,
      name,
      keyPrefix,
      hashedKey
    });

    const actorName = req.user!.name || (req.user!.email ? req.user!.email.split('@')[0] : 'Unknown User');

    await AuditLog.create({
      workspaceId: workspace._id,
      actorId: req.user!.clerkId,
      action: 'generated_api_key',
      entity: 'API Key',
      metadata: { keyName: name, entityId: apiKey._id, actorName }
    });

    // We only return the rawKey ONCE
    return res.status(201).json({ success: true, data: { apiKey, rawKey } });
  } catch (error: any) {
    console.error('Generate API Key Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate API Key' });
  }
};

export const listAPIKeys = async (req: Request, res: Response) => {
  try {
    const workspace = (req as any).workspace || await Workspace.findOne({ ownerId: req.user!.clerkId });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    const keys = await APIKey.find({ workspaceId: workspace._id, status: 'active' })
      .select('-hashedKey')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: keys });
  } catch (error) {
    console.error('List API Keys Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to list API Keys' });
  }
};

export const revokeAPIKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspace = (req as any).workspace || await Workspace.findOne({ ownerId: req.user!.clerkId });
    if (!workspace) return res.status(404).json({ success: false, error: 'Workspace not found' });

    const apiKey = await APIKey.findOneAndUpdate(
      { _id: id, workspaceId: workspace._id },
      { status: 'revoked' },
      { new: true }
    );

    if (!apiKey) return res.status(404).json({ success: false, error: 'API Key not found' });

    const actorName = req.user!.name || (req.user!.email ? req.user!.email.split('@')[0] : 'Unknown User');

    await AuditLog.create({
      workspaceId: workspace._id,
      actorId: req.user!.clerkId,
      action: 'revoked_api_key',
      entity: 'API Key',
      metadata: { keyName: apiKey.name, entityId: apiKey._id, actorName }
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Revoke API Key Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to revoke API Key' });
  }
};
