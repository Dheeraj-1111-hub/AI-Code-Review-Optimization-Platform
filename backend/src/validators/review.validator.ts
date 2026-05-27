import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'cpp', 'c', 'ruby', 'php'] as const;

export const startReviewSchema = z.object({
  body: z.object({
    code: z.string().min(10, 'Code must be at least 10 characters').max(50000, 'Code too large (max 50,000 chars)'),
    language: z.enum(SUPPORTED_LANGUAGES, {
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    }),
    repositoryId: z.string().optional(),
    fileName: z.string().optional(),
  }),
});

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
});
