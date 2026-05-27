import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  name: string;
  fullName: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  owner: string;
  description?: string;
  defaultBranch: string;
  language?: string;
  visibility: 'public' | 'private';
  cloneUrl?: string;
  isPrivate: boolean;
  stars: number;
  forks: number;
  workspaceId: mongoose.Types.ObjectId;
  connectedBy?: mongoose.Types.ObjectId;
  lastScannedAt?: Date;
  healthScore: number;
  metrics: {
    security: number;
    performance: number;
    maintainability: number;
    architecture: number;
  };
  stats: {
    pullRequests: number;
    commits: number;
    contributors: number;
    files: number;
  };
  integrations: {
    githubAppInstalled: boolean;
    webhookActive: boolean;
  };
  latestReviewId?: mongoose.Types.ObjectId;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true, unique: true },
    provider: { type: String, enum: ['github', 'gitlab', 'bitbucket'], default: 'github' },
    owner: { type: String, required: true },
    description: { type: String },
    defaultBranch: { type: String, default: 'main' },
    language: { type: String },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    cloneUrl: { type: String },
    isPrivate: { type: Boolean, default: false },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    connectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastScannedAt: { type: Date },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    metrics: {
      security: { type: Number, default: 100 },
      performance: { type: Number, default: 100 },
      maintainability: { type: Number, default: 100 },
      architecture: { type: Number, default: 100 },
    },
    stats: {
      pullRequests: { type: Number, default: 0 },
      commits: { type: Number, default: 0 },
      contributors: { type: Number, default: 0 },
      files: { type: Number, default: 0 },
    },
    integrations: {
      githubAppInstalled: { type: Boolean, default: false },
      webhookActive: { type: Boolean, default: false },
    },
    latestReviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
    tags: [{ type: String }],
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
RepositorySchema.index({ workspaceId: 1, isArchived: 1 });

export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);
