import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "lupa-secret-key";
const BCRYPT_SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["buyer", "seller", "admin"] as const;

type UserRole = (typeof ALLOWED_ROLES)[number];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const buildUserResponse = (user: { id: string; email: string; role: string; full_name: string }) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fullName: user.full_name,
});

export const login = async (req: Request, res: Response) => {
  const email = req.body.email ? normalizeEmail(req.body.email) : "";
  const password = req.body.password;
  const role = req.body.role as UserRole | undefined;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required." });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role provided." });
  }

  try {
    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = result.rows[0];

    if (user.role !== role) {
      return res.status(401).json({ error: "Invalid role for this user." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Unable to login. Please try again later." });
  }
};

export const signup = async (req: Request, res: Response) => {
  const email = req.body.email ? normalizeEmail(req.body.email) : "";
  const password = req.body.password;
  const role = req.body.role as UserRole | undefined;
  const fullName = req.body.fullName?.trim() || email.split("@")[0];
  const phone = req.body.phone?.trim() || "0000000000";

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required." });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role provided." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role`,
      [fullName, email, phone, passwordHash, role]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      token,
      user: buildUserResponse(user),
    });
  } catch (error: any) {
    console.error("Signup error:", error.message, error.code);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
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
    console.error("Fetch current user error:", error);
    return res.status(500).json({ error: "Unable to fetch current user." });
  }
};
