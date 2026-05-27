import mongoose from 'mongoose';
import Review, { IReview } from '../models/Review';

export interface GetReviewsQuery {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
  language?: string;
  search?: string;
}

export const getReviewsWithFilters = async (query: GetReviewsQuery) => {
  const { userId, page = 1, limit = 20, status, language, search } = query;
  
  const filter: any = { 
    userId,
    isArchived: { $ne: true } 
  };

  if (status && status !== 'all') {
    filter.status = status;
  }
  
  if (language && language !== 'all') {
    filter.language = language;
  }

  if (search) {
    // Basic regex search across title, branch, and AI summary
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { branch: { $regex: search, $options: 'i' } },
      { aiSummary: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-codeInput -agentResults -patches -staticIssues') // Don't return heavy payload for list view
      .lean(),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};
