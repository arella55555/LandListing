import { Request, Response } from 'express';
import { pool } from '../config/db';

const verifyListingOwnership = async (listingId: string, userId: string, userRole: string): Promise<boolean> => {
  if (userRole === 'admin') return true;
  const result = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [listingId]);
  if (result.rows.length === 0) return false;
  return result.rows[0].seller_id === userId;
};

export const addListingImage = async (req: Request, res: Response) => {
  try {
    const { listing_id, image_url, is_primary, sort_order } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!listing_id || !image_url) {
      return res.status(400).json({ message: "Listing ID and Image URL are required." });
    }

    const hasAccess = await verifyListingOwnership(listing_id, userId!, userRole!);
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden. You do not own this listing." });
    }

    const result = await pool.query(
      `INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [listing_id, image_url, is_primary ?? false, sort_order ?? 0]
    );

    res.status(201).json({ message: "Image added successfully", image: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error adding listing image", error });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const { listing_id } = req.params; 

    const result = await pool.query(
      'SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY sort_order ASC, created_at DESC',
      [listing_id]
    );

    res.status(200).json({ images: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listing images", error });
  }
};

export const updateListingImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_primary, sort_order, image_url } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const imageCheck = await pool.query('SELECT listing_id FROM listing_images WHERE id = $1', [id]);
    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    const listingId = imageCheck.rows[0].listing_id;
    const hasAccess = await verifyListingOwnership(listingId, userId!, userRole!);
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden. You do not own this listing." });
    }

    const result = await pool.query(
      `UPDATE listing_images 
       SET is_primary = COALESCE($1, is_primary),
           sort_order = COALESCE($2, sort_order),
           image_url = COALESCE($3, image_url)
       WHERE id = $4 
       RETURNING *`,
      [
        is_primary === undefined ? null : is_primary, 
        sort_order ?? null,
        image_url || null,
        id
      ]
    );

    res.status(200).json({ message: "Image updated successfully", image: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating listing image", error });
  }
};

export const deleteListingImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const imageCheck = await pool.query('SELECT listing_id FROM listing_images WHERE id = $1', [id]);
    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    const listingId = imageCheck.rows[0].listing_id;
    const hasAccess = await verifyListingOwnership(listingId, userId!, userRole!);
    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden. You do not own this listing." });
    }

    await pool.query('DELETE FROM listing_images WHERE id = $1', [id]);
    res.status(200).json({ message: "Image removed from listing successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing image", error });
  }
};
