import { Request, Response, NextFunction } from 'express';

// Define roles strictly matching your database schema constraint
type UserRole = 'buyer' | 'seller' | 'admin';

// Extend Express Request interface locally to handle compilation checks smoothly
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
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
