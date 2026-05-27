import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const protect = [
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check if the user exists in our DB
    const { userId: clerkId } = getAuth(req);
    
    if (!clerkId) {
      return next(new ApiError(401, 'Unauthorized request. No valid Clerk token.'));
    }

    const user = await User.findOne({ clerkId });
    
    if (!user) {
      // Allow syncing route to proceed without a DB user
      if (req.originalUrl.includes('/sync')) {
        return next();
      }
      return next(new ApiError(401, 'User record not found in database. Please sync first.'));
    }

    req.user = user;
    next();
  })
];
