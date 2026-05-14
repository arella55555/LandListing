import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { UserRole } from '../types/express';

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

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

/*
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email',
      [email, hashedPassword, username]
    );
    
    res.status(201).json({ message: "User created successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};
*/