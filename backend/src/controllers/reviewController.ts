import { Request, Response } from 'express';
import pool from '../config/db';

export const createReview = async (req: Request, res: Response) => {
  try {
    const reviewer_id = req.user?.id; 
    const { listing_id, rating, comment } = req.body;

    if (!listing_id || !rating) {
      return res.status(400).json({ message: "Listing ID and rating are required." });
    }

    const listingCheck = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [listing_id]);
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const seller_id = listingCheck.rows[0].seller_id;

    if (reviewer_id === seller_id) {
      return res.status(400).json({ message: "You cannot review your own listing." });
    }

    const result = await pool.query(
      `INSERT INTO reviews (reviewer_id, seller_id, listing_id, rating, comment) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [reviewer_id, seller_id, listing_id, rating, comment || null]
    );

    res.status(201).json({ message: "Review submitted successfully", review: result.rows[0] });
  } catch (error: any) {
  
    if (error.code === '23505') {
      return res.status(400).json({ message: "You have already left a review for this listing." });
    }
    res.status(500).json({ message: "Error submitting review", error });
  }
};

export const getReviewsBySeller = async (req: Request, res: Response) => {
  try {
    const { seller_id } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.full_name as reviewer_name 
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.seller_id = $1 
       ORDER BY r.created_at DESC`,
      [seller_id]
    );

    res.status(200).json({ reviews: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller reviews", error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { rating, comment } = req.body;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    const reviewCheck = await pool.query('SELECT reviewer_id FROM reviews WHERE id = $1', [id]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (reviewCheck.rows[0].reviewer_id !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You cannot modify someone else's review." });
    }

    const result = await pool.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating), 
           comment = COALESCE($2, comment)
       WHERE id = $3 
       RETURNING *`,
      [rating || null, comment || null, id]
    );

    res.status(200).json({ message: "Review updated successfully", review: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    const reviewCheck = await pool.query('SELECT reviewer_id FROM reviews WHERE id = $1', [id]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (reviewCheck.rows[0].reviewer_id !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You cannot delete this review." });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};
