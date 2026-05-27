import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType =
  | 'review_started'
  | 'review_completed'
  | 'review_failed'
  | 'repository_added'
  | 'repository_removed'
  | 'workspace_created'
  | 'member_invited';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  message: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'review_started',
        'review_completed',
        'review_failed',
        'repository_added',
        'repository_removed',
        'workspace_created',
        'member_invited',
      ],
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL — auto-delete activity logs older than 90 days
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
