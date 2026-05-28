import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lupa-secret-key";

type UserRole = "buyer" | "seller" | "admin";

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

interface JwtPayload {
  id: string;
  role: UserRole;
  is_verified: boolean;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      is_verified: decoded.is_verified,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

