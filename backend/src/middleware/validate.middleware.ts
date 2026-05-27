import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // @ts-ignore
        const errors = error.errors.map((e: any) => e.message).join(', ');
        return next(new ApiError(400, `Validation Error: ${errors}`));
      }
      next(error);
    }
  };
};
