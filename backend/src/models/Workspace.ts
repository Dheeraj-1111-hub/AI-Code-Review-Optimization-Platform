import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'owner' | 'admin' | 'reviewer' | 'developer' | 'viewer';

export interface IWorkspaceMember {
  userId: string; // Clerk User ID
  role: Role;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  members: IWorkspaceMember[];
  repositories: mongoose.Types.ObjectId[];
  settings: {
    isPublic: boolean;
    autoReviewEnabled: boolean;
  };
  aiConfig: {
    refactorAggression: 'low' | 'medium' | 'high';
    blockOnCriticalSecurity: boolean;
    inlineReasoning: boolean;
    notifyArchitectureDrift: boolean;
    modelSelection: 'gpt-4o' | 'claude-3.5' | 'llama-3';
  };
  integrations?: {
    slack?: {
      connected: boolean;
      webhookUrl: string;
    };
    github?: {
      connected: boolean;
      accessToken?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema({
  userId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'reviewer', 'developer', 'viewer'], 
    default: 'viewer' 
  },
  joinedAt: { type: Date, default: Date.now }
});

const WorkspaceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a workspace name'],
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    slug: { type: String, required: true, unique: true },
    ownerId: {
      type: String, // Clerk ID
      required: true,
    },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    members: [WorkspaceMemberSchema],
    repositories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Repository',
      },
    ],
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      autoReviewEnabled: {
        type: Boolean,
        default: true,
      },
    },
    aiConfig: {
      refactorAggression: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      blockOnCriticalSecurity: { type: Boolean, default: true },
      inlineReasoning: { type: Boolean, default: true },
      notifyArchitectureDrift: { type: Boolean, default: false },
      modelSelection: { type: String, enum: ['gpt-4o', 'claude-3.5', 'llama-3'], default: 'gpt-4o' }
    },
    integrations: {
      slack: {
        connected: { type: Boolean, default: false },
        webhookUrl: { type: String }
      },
      github: {
        connected: { type: Boolean, default: false },
        accessToken: { type: String }
      }
    }
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
