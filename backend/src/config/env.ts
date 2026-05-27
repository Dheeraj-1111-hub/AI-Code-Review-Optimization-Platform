import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  MONGO_URI: z.string().url(),
  
  CLERK_SECRET_KEY: z.string().min(1),
  
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
