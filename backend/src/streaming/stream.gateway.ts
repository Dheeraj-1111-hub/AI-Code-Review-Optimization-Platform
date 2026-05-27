import { Server, Socket } from 'socket.io';
import { CacheService } from '../cache/redis.client';

export class StreamGateway {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Broadcasts a stream chunk to a specific review room, caching it temporarily
   * so disconnected clients can fetch missed chunks upon reconnection.
   */
  async broadcastReviewChunk(reviewId: string, type: 'status' | 'chunk' | 'complete' | 'error', data: any) {
    const payload = { type, ...data, timestamp: Date.now() };
    
    // 1. Emit live to connected clients
    this.io.to(`review_${reviewId}`).emit('review-chunk', payload);

    // 2. Buffer into Redis for resume capability (keep last 100 chunks for 1 hour)
    const bufferKey = `stream_buffer_${reviewId}`;
    try {
      const existingStr = await CacheService.get(bufferKey);
      const buffer = existingStr ? existingStr : [];
      buffer.push(payload);
      
      // Limit buffer size to prevent memory leaks
      if (buffer.length > 500) buffer.shift();
      
      await CacheService.set(bufferKey, buffer, 3600);
    } catch (error) {
      console.error(`Failed to buffer stream chunk for review ${reviewId}:`, error);
    }
  }

  /**
   * Handles client reconnections by flushing missed buffer events.
   */
  async handleReconnect(socket: Socket, reviewId: string, lastTimestamp: number) {
    socket.join(`review_${reviewId}`);
    console.log(`Client reconnected to review ${reviewId}`);

    const bufferKey = `stream_buffer_${reviewId}`;
    const buffer = await CacheService.get(bufferKey);
    
    if (buffer && Array.isArray(buffer)) {
      // Replay all events that occurred after the client disconnected
      const missedEvents = buffer.filter(evt => evt.timestamp > lastTimestamp);
      for (const evt of missedEvents) {
        socket.emit('review-chunk', evt);
      }
      console.log(`Replayed ${missedEvents.length} missed events for review ${reviewId}`);
    }
  }
}
