import { Server, Socket } from 'socket.io';
import { registerReviewSocketHandlers } from './review.socket';
import { logger } from '../utils/logger';

export const registerSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

    // Register domain-specific handlers
    registerReviewSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });
  });
};
