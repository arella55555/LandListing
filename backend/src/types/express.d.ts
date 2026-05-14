import { Request } from 'express';

export type UserRole = 'buyer' | 'seller' | 'admin';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}