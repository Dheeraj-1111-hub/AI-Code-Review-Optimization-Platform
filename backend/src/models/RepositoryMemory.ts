import mongoose, { Schema, Document } from 'mongoose';

export interface IRepositoryMemory extends Document {
  repositoryId: mongoose.Types.ObjectId;
  patterns: string[];
  architectureRules: string[];
  teamPreferences: string[];
  commonIssues: string[];
  dependencyPatterns: any;
  createdAt: Date;
  updatedAt: Date;
}

const RepositoryMemorySchema: Schema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      unique: true,
    },
    patterns: [{ type: String }],
    architectureRules: [{ type: String }],
    teamPreferences: [{ type: String }],
    commonIssues: [{ type: String }],
    dependencyPatterns: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const RepositoryMemory = mongoose.model<IRepositoryMemory>('RepositoryMemory', RepositoryMemorySchema);
