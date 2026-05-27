import { Document } from 'mongoose';
import { IUser } from '../models/User';
import { AuthObject } from '@clerk/express';

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: User | null;
      auth?: AuthObject;
    }
  }
}
