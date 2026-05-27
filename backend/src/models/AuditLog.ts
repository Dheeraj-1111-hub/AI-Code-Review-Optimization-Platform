import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  actorId: string; // Clerk ID of the user performing the action
  action: string;
  entity: string; // e.g., 'Repository', 'Review', 'WorkspaceSettings'
  metadata: any;
  ipAddress: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, expires: '365d' } // Retain for 1 year
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
