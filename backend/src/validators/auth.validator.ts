import { z } from 'zod';

export const syncUserSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Clerk ID is required'),
    primaryEmailAddress: z.object({
      emailAddress: z.string().email('Invalid email address'),
    }).nullable().optional(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
  }),
});
