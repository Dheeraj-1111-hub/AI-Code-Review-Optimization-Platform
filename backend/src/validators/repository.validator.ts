import { z } from 'zod';

export const createRepositorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Repository name is required').max(100),
    owner: z.string().min(1, 'Repository owner is required').max(100),
    provider: z.enum(['github', 'gitlab', 'bitbucket']).default('github'),
    language: z.string().optional(),
    description: z.string().optional(),
    defaultBranch: z.string().default('main'),
    visibility: z.enum(['public', 'private']).default('public'),
    isPrivate: z.boolean().default(false),
    workspaceId: z.string().optional(),
  }),
});

export const updateRepositorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    language: z.string().optional(),
    description: z.string().optional(),
    branch: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Repository ID is required'),
  }),
});
