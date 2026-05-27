import mongoose, { Document, Schema } from 'mongoose';

export interface IAssistantConversation extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistantConversationSchema = new Schema<IAssistantConversation>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: String, required: true },
    title: { type: String, default: 'New Conversation' },
  },
  {
    timestamps: true,
  }
);

export const AssistantConversation = mongoose.model<IAssistantConversation>('AssistantConversation', AssistantConversationSchema);
