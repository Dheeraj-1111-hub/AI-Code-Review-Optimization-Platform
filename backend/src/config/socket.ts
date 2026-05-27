import { Server } from 'socket.io';
import http from 'http';
import { env } from './env';
import { verifyToken } from '@clerk/backend';
import { registerSocketHandlers } from '../sockets';

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === env.FRONTEND_URL || 
          origin.startsWith('http://localhost:') || 
          origin.endsWith('.vercel.app')
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const verified = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });

      if (!verified) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.userId = verified.sub;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Register all socket event handlers
  registerSocketHandlers(io);

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
