import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createAdminLog = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user?.id; 
    const { action, target_type, target_id, notes } = req.body;

    if (!action || !target_type || !target_id) {
      return res.status(400).json({ message: "Action, target type, and target ID are required." });
    }

    const result = await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [admin_id, action, target_type, target_id, notes || null]
    );

    res.status(201).json({ message: "Admin audit log entry recorded.", log: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error recording admin log entry.", error });
  }
};

export const getAllAdminLogs = async (req: Request, res: Response) => {
  try {
    
    const result = await pool.query(
      `SELECT al.*, u.full_name as admin_name 
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC`
    );
    res.status(200).json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching system audit logs.", error });
  }
};

export const getAdminLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT al.*, u.full_name as admin_name 
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       WHERE al.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Audit log entry not found." });
    }

    res.status(200).json({ log: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching individual log record.", error });
  }
};
