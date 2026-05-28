import { Request, Response } from "express";
import { pool } from "../config/db";

export const getProfile = async (req: Request, res: Response) => {
  const authUser = (req as any).user;

  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, phone, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [authUser.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        phone: user.phone,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Unable to fetch profile." });
  }
};
