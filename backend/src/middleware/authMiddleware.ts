import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: number;
  role: UserRole;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { 
      id: decoded.id,
      role: decoded.role 
    }; 
    next(); 
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};