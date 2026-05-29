import { Request, Response, NextFunction } from 'express';

export const requireVerification = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  if (!req.user?.is_verified) {
    return res.status(403).json({ 
      message: "Access Denied. Your account is unverified. Please confirm your email/phone records to proceed." 
    });
  }
  next();
};
