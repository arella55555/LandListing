import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { UserRole } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET as string;
const VALID_ROLES: UserRole[] = ['buyer', 'seller', 'admin'];

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, role } = req.body;

    const userRole: UserRole = VALID_ROLES.includes(role) ? role : 'buyer';

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, hashedPassword, username, userRole]
    );
    
    res.status(201).json({ message: "User created successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error});
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, email, username, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    let updatedRole: UserRole | undefined;
    if (role) {
      updatedRole = VALID_ROLES.includes(role) ? role : 'buyer';
    }

    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username), 
           email = COALESCE($2, email), 
           role = COALESCE($3, role) 
       WHERE id = $4 
       RETURNING id, email, username, role`,
      [username, email, updatedRole, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User account permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};