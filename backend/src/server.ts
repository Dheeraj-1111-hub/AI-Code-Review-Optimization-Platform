import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { initSocket } from './config/socket';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = http.createServer(app);

  // Initialize Socket.io
  initSocket(server);

  // Start Server
  server.listen(env.PORT, () => {
    logger.info(
      `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
    );
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: any) => {
    logger.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
