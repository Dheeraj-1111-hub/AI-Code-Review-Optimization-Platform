import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export const auditLogger = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We only want to log if the request actually succeeds
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // @ts-ignore
          const actorId = req.auth?.userId || 'system';
          const workspaceId = req.params.workspaceId || req.body.workspaceId;
          const ipAddress = req.ip || req.connection.remoteAddress;

          // Don't crash the request if audit logging fails
          if (workspaceId) {
            await AuditLog.create({
              workspaceId,
              actorId,
              action,
              entity,
              metadata: {
                method: req.method,
                path: req.originalUrl,
                params: req.params,
                query: req.query
              },
              ipAddress
            });
          }
        } catch (error) {
          console.error('[Audit Logger] Failed to record audit log:', error);
        }
      }
    });

    next();
  };
};
