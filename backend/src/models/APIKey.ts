import mongoose, { Schema, Document } from 'mongoose';

export interface IAPIKey extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: string; // ClerkId of the creator
  name: string;
  keyPrefix: string;
  hashedKey: string;
  lastUsedAt?: Date;
  status: 'active' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

const APIKeySchema: Schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    keyPrefix: { type: String, required: true },
    hashedKey: { type: String, required: true },
    lastUsedAt: { type: Date },
    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IAPIKey>('APIKey', APIKeySchema);
