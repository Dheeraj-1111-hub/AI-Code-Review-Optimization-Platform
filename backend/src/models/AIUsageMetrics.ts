import mongoose, { Schema, Document } from 'mongoose';

export interface IAIUsageMetrics {
  workspaceId: mongoose.Types.ObjectId;
  tokensUsed: number;
  model: string;
  costEstimateCents: number;
  latencyMs: number;
  actionType: 'review' | 'analytics' | 'pr_scan';
  timestamp: Date;
}

const AIUsageMetricsSchema: Schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    tokensUsed: { type: Number, required: true },
    model: { type: String, required: true },
    costEstimateCents: { type: Number, default: 0 },
    latencyMs: { type: Number, required: true },
    actionType: { type: String, enum: ['review', 'analytics', 'pr_scan'], required: true },
    timestamp: { type: Date, default: Date.now },
  }
);

export const AIUsageMetrics = mongoose.model<IAIUsageMetrics & mongoose.Document>('AIUsageMetrics', AIUsageMetricsSchema);
