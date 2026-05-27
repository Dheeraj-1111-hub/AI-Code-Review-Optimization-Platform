import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewComment extends Document {
  reviewId: mongoose.Types.ObjectId;
  authorId: string; // Clerk User ID
  content: string;
  mentions: string[]; // array of Clerk User IDs mentioned
  line_number?: number;
  file_path?: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewCommentSchema: Schema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mentions: [{ type: String }],
    line_number: { type: Number },
    file_path: { type: String },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ReviewComment = mongoose.model<IReviewComment>('ReviewComment', ReviewCommentSchema);
