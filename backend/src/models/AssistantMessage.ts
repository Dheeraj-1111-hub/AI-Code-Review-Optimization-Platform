import mongoose, { Document, Schema } from 'mongoose';

export interface IAssistantMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  context?: {
    currentPage?: string;
    repositoryId?: mongoose.Types.ObjectId;
    reviewId?: mongoose.Types.ObjectId;
    prNumber?: number;
    [key: string]: any;
  };
  toolCalls?: any[];
  createdAt: Date;
}

const AssistantMessageSchema = new Schema<IAssistantMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'AssistantConversation', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
    content: { type: String, required: true },
    context: {
      currentPage: { type: String },
      repositoryId: { type: Schema.Types.ObjectId, ref: 'Repository' },
      reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
      prNumber: { type: Number },
    },
    toolCalls: [{ type: Schema.Types.Mixed }], // Flexible for tool call data
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
  }
);

export const AssistantMessage = mongoose.model<IAssistantMessage>('AssistantMessage', AssistantMessageSchema);
