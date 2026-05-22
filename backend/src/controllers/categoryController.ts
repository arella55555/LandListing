import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, icon || null]
    );

    res.status(201).json({ message: "Category created successfully", category: result.rows[0] });
  } catch (error: any) {
    // Handle unique constraint violation for category names
    if (error.code === '23505') {
      return res.status(400).json({ message: "A category with this name already exists." });
    }
    res.status(500).json({ message: "Error creating category", error });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.status(200).json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Handles standard SERIAL integer ID

    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const result = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           icon = COALESCE($3, icon) 
       WHERE id = $4 
       RETURNING *`,
      [name || null, description || null, icon || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "A category with this name already exists." });
    }
    res.status(500).json({ message: "Error updating category", error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    // Handle foreign key constraint if listings are using this category
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: "Cannot delete category. It is currently linked to active listings." 
      });
    }
    res.status(500).json({ message: "Error deleting category", error });
  }
};
