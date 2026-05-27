import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceAISettings extends Document {
  workspaceId: mongoose.Types.ObjectId;
  strictness: 'low' | 'medium' | 'high';
  preferredModels: {
    heavy: string;
    fast: string;
  };
  reviewDepth: 'syntax' | 'architecture' | 'deep-scan';
  customRules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceAISettingsSchema: Schema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      unique: true,
    },
    strictness: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    preferredModels: {
      heavy: { type: String, default: 'llama-3.3-70b-versatile' },
      fast: { type: String, default: 'llama3-8b-8192' },
    },
    reviewDepth: { type: String, enum: ['syntax', 'architecture', 'deep-scan'], default: 'architecture' },
    customRules: [{ type: String }],
  },
  { timestamps: true }
);

export const WorkspaceAISettings = mongoose.model<IWorkspaceAISettings>('WorkspaceAISettings', WorkspaceAISettingsSchema);
