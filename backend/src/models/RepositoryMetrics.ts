import mongoose, { Schema, Document } from 'mongoose';

export interface IRepositoryMetrics extends Document {
  repositoryId: mongoose.Types.ObjectId;
  healthScore: number;
  technicalDebt: number;
  architectureComplexity: number;
  vulnerabilityCount: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  maintainabilityTrend: 'improving' | 'stable' | 'declining';
  aiConfidenceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepositoryMetricsSchema: Schema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    healthScore: { type: Number, default: 100 },
    technicalDebt: { type: Number, default: 0 }, // measured in estimated hours or abstract points
    architectureComplexity: { type: Number, default: 0 },
    vulnerabilityCount: { type: Number, default: 0 },
    performanceTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    maintainabilityTrend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    aiConfidenceScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const RepositoryMetrics = mongoose.model<IRepositoryMetrics>('RepositoryMetrics', RepositoryMetricsSchema);
