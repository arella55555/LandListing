import { Request, Response } from 'express';
import { pool } from '../config/db';

type TitleStatus = 'TCT' | 'OCT' | 'tax_dec' | 'other';
type ListingType = 'sale' | 'rent' | 'lease';
type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'leased' | 'rented' | 'rejected' | 'archived';

export const createListing = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user?.id; 
    const {
      category_id, title, description, price, area_sqm,
      latitude, longitude, barangay, municipality, province,
      title_status, listing_type, status, negotiable
    } = req.body;

    const result = await pool.query(
      `INSERT INTO listings (
        seller_id, category_id, title, description, price, area_sqm,
        latitude, longitude, barangay, municipality, province,
        title_status, listing_type, status, negotiable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        seller_id, category_id, title, description, price, area_sqm,
        latitude, longitude, barangay, municipality, province,
        title_status || 'other', listing_type || 'sale', status || 'pending', negotiable ?? true
      ]
    );

    res.status(201).json({ message: "Listing created successfully", listing: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error creating listing", error });
  }
};

export const getAllListings = async (req: Request, res: Response) => {
  try {

    const result = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');
    res.status(200).json({ listings: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings", error });
  }
};

export const getListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ listing: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listing", error });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller_id = req.user?.id; 
    const {
      category_id, title, description, price, area_sqm,
      latitude, longitude, barangay, municipality, province,
      title_status, listing_type, status, negotiable
    } = req.body;

    const checkOwnership = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [id]);
    if (checkOwnership.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }
    
    if (checkOwnership.rows[0].seller_id !== seller_id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not own this listing." });
    }

    const result = await pool.query(
      `UPDATE listings 
       SET category_id = COALESCE($1, category_id),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           area_sqm = COALESCE($5, area_sqm),
           latitude = COALESCE($6, latitude),
           longitude = COALESCE($7, longitude),
           barangay = COALESCE($8, barangay),
           municipality = COALESCE($9, municipality),
           province = COALESCE($10, province),
           title_status = COALESCE($11, title_status),
           listing_type = COALESCE($12, listing_type),
           status = COALESCE($13, status),
           negotiable = COALESCE($14, negotiable),
           updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        category_id || null, title || null, description || null, price || null, area_sqm || null,
        latitude || null, longitude || null, barangay || null, municipality || null, province || null,
        title_status || null, listing_type || null, status || null, negotiable ?? null, id
      ]
    );

    res.status(200).json({ message: "Listing updated successfully", listing: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating listing", error });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller_id = req.user?.id;

    const checkOwnership = await pool.query('SELECT seller_id FROM listings WHERE id = $1', [id]);
    if (checkOwnership.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (checkOwnership.rows[0].seller_id !== seller_id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You do not own this listing." });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    res.status(200).json({ message: "Listing permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing", error });
  }
};
