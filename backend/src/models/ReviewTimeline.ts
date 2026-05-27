import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewTimeline extends Document {
  reviewId: mongoose.Types.ObjectId;
  eventType: 'analysis_started' | 'finding_generated' | 'patch_generated' | 'patch_applied' | 'review_completed' | 'review_failed';
  message: string;
  metadata?: any;
  createdAt: Date;
}

const ReviewTimelineSchema: Schema = new Schema(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
    eventType: { 
      type: String, 
      enum: ['analysis_started', 'finding_generated', 'patch_generated', 'patch_applied', 'review_completed', 'review_failed'],
      required: true
    },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IReviewTimeline>('ReviewTimeline', ReviewTimelineSchema);
