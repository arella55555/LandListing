import { Request, Response, NextFunction } from 'express';

type UserRole = 'buyer' | 'seller' | 'admin';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        is_verified: boolean;
      };
    }
  }
}

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. This action requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }

    next(); 
  };
};
