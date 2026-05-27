import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

export const registerReviewSocketHandlers = (io: Server, socket: Socket) => {
  // Join a specific review room to receive streaming events
  socket.on('join-review', (reviewId: string) => {
    if (!reviewId) return;
    socket.join(`review_${reviewId}`);
    logger.info(`Socket ${socket.id} joined review room: review_${reviewId}`);
  });

  // Leave a review room when done
  socket.on('leave-review', (reviewId: string) => {
    if (!reviewId) return;
    socket.leave(`review_${reviewId}`);
    logger.info(`Socket ${socket.id} left review room: review_${reviewId}`);
  });
};
