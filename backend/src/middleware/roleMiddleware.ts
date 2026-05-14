import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/express';

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