import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import { env } from './config/env';
import routes from './routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Logging Middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk Middleware
app.use(clerkMiddleware());

// Add webhooks before body-parser if you need raw buffers for validation, but express.json() works if you compute HMAC from stringified body (as done in our webhook).
app.use('/api/webhooks', webhookRoutes);

// Register standard API routes
app.use('/api/v1', routes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DevLens AI API is running (Clerk Auth)' });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

export default app;
