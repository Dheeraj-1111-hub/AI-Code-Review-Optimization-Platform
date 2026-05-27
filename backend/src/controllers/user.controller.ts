import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { getAuth } from '@clerk/express';
import Review from '../models/Review';
import ReviewTimeline from '../models/ReviewTimeline';
import { Workspace } from '../models/Workspace';

export const syncUser = asyncHandler(async (req: Request, res: Response) => {
  const { id: clerkId, primaryEmailAddress, username, imageUrl, firstName, lastName } = req.body;

  const { userId } = getAuth(req);
  if (userId !== clerkId) {
    return res.status(403).json(new ApiResponse(403, 'Forbidden: Clerk ID mismatch'));
  }

  const incomingName = firstName && lastName ? `${firstName} ${lastName}` : username;
  const email = primaryEmailAddress?.emailAddress;
  
  let user = await User.findOne({ clerkId });

  if (user) {
    // Update existing user, but never overwrite a custom name with Anonymous User
    user.email = email || user.email;
    if (incomingName) {
      user.name = incomingName;
    } else if (!user.name) {
      user.name = 'Anonymous User';
    }
    
    user.avatar = imageUrl || user.avatar;
    user.username = username || user.username;
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      clerkId,
      email,
      name: incomingName || 'Anonymous User',
      avatar: imageUrl,
      username,
    });
  }

  res.status(200).json(
    new ApiResponse(200, 'User synced successfully', {
      id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
    })
  );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, 'User retrieved successfully', req.user));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body; // In a true app, we might sync email back to Clerk, but here we just update local
  const clerkId = req.user!.clerkId;

  const user = await User.findOneAndUpdate(
    { clerkId },
    { name, email },
    { new: true }
  );

  if (!user) {
    return res.status(404).json(new ApiResponse(404, 'User not found'));
  }

  res.status(200).json(new ApiResponse(200, 'Profile updated successfully', user));
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const clerkId = req.user!.clerkId;
  const workspace = await Workspace.findOne({ ownerId: clerkId });
  
  if (!workspace) {
    return res.status(200).json(new ApiResponse(200, 'Success', []));
  }

  // Get recent reviews for this workspace
  const reviews = await Review.find({ workspaceId: workspace._id }).select('_id title').lean();
  const reviewIds = reviews.map(r => r._id);

  const events = await ReviewTimeline.find({ reviewId: { $in: reviewIds } })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('reviewId', 'title')
    .lean();

  const notifications = events.map((e: any) => ({
    id: e._id.toString(),
    title: e.eventType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    desc: e.message,
    time: e.createdAt,
    type: e.eventType,
    unread: false
  }));

  res.status(200).json(new ApiResponse(200, 'Notifications fetched successfully', notifications));
});
