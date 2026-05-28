import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "lupa-secret-key";
type UserRole = "buyer" | "seller" | "admin";
const VALID_ROLES: UserRole[] = ["buyer", "seller", "admin"];

const createToken = (user: { id: string; role: UserRole; is_verified?: boolean }) => {
  return jwt.sign(
    { id: user.id, role: user.role, is_verified: user.is_verified ?? false },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const getProfile = async (req: Request, res: Response) => {
  const authUser = (req as any).user;

  if (!authUser) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, phone, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [authUser.id || authUser.userId]
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

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : "";
    const userRole: UserRole = VALID_ROLES.includes(role) ? role : "buyer";
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, is_verified, created_at`,
      [full_name, normalizedEmail, phone, hashedPassword, userRole]
    );

    res.status(201).json({ message: "User created successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({
      id: user.id,
      role: user.role,
      is_verified: user.is_verified,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, full_name, email, phone, role, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role } = req.body;
    const updatedRole = role && VALID_ROLES.includes(role) ? role : null;

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, full_name, email, phone, role, updated_at`,
      [full_name || null, email || null, phone || null, updatedRole, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User account permanently deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

export const verifyUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User account context missing." });
    }

    const result = await pool.query(
      "UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, role, is_verified",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User account not found." });
    }

    const updatedUser = result.rows[0];
    const newToken = createToken({
      id: updatedUser.id,
      role: updatedUser.role,
      is_verified: updatedUser.is_verified,
    });

    res.status(200).json({
      message: "Account verified successfully!",
      token: newToken,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    res.status(500).json({ message: "Verification failed", error });
  }
};
