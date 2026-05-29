import { Request, Response } from 'express';
import { pool } from '../config/db';
import jwt from 'jsonwebtoken';

type TitleStatus = 'TCT' | 'OCT' | 'tax_dec' | 'other';
type ListingType = 'sale' | 'rent' | 'lease';
type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'leased' | 'rented' | 'rejected' | 'archived';

const JWT_SECRET = process.env.JWT_SECRET as string;

const hydrateListingImages = async (listing: any) => {
  const imageResult = await pool.query(
    `SELECT id, listing_id, image_url, is_primary, sort_order
     FROM listing_images
     WHERE listing_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [listing.id]
  );

  const images = imageResult.rows;
  return {
    ...listing,
    images,
    primary_image_url: images.find((image: any) => image.is_primary)?.image_url ?? images[0]?.image_url ?? null,
  };
};

const getOptionalUserId = (req: Request): string | null => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null; // Ignore invalid tokens and treat user as a public guest
  }
}

export const createListing = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user?.id; 
    const {
      category_id, title, description, price, area_sqm,
      latitude, longitude, barangay, municipality, province,
      title_status, listing_type, status, negotiable
    } = req.body;

    const duplicateCheck = await pool.query(
      `SELECT id FROM listings 
       WHERE seller_id = $1 
       AND (
         (latitude = $2 AND longitude = $3) 
         OR (LOWER(title) = LOWER($4) AND LOWER(municipality) = LOWER($5) AND LOWER(province) = LOWER($6))
       )
       AND status NOT IN ('sold', 'leased', 'rented', 'archived')`, // Ignore finalized or archived deals
      [seller_id, latitude, longitude, title, municipality, province]
    );

    // If a matching active listing is found, block the creation request immediately
    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: "Duplicate listing detected. You have already posted an active property with this exact title or geographic location." 
      });
    }

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

    const created = result.rows[0];

    // If client provided image_urls (upload-first flow), persist them in listing_images
    const imageUrls: string[] = req.body.image_urls || [];
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const inserts = imageUrls.map((url: string, idx: number) => {
        return pool.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES ($1, $2, $3, $4)`,
          [created.id, url, idx === 0, idx]
        );
      });
      await Promise.all(inserts);
    }

    res.status(201).json({ message: "Listing created successfully", listing: created });
  } catch (error) {
    res.status(500).json({ message: "Error creating listing", error });
  }
};

export const getAllListings = async (req: Request, res: Response) => {
    try {
    const currentUserId = getOptionalUserId(req);
    // SQL LEFT JOIN: Checks if a matching row exists in saved_listings for this user
    const query = `
      SELECT l.*, 
             CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END as is_saved
      FROM listings l
      LEFT JOIN saved_listings s ON l.id = s.listing_id AND s.user_id = $1
      ORDER BY l.created_at DESC
    `;

    const result = await pool.query(query, [currentUserId]);
    const listings = await Promise.all(result.rows.map(hydrateListingImages));
    res.status(200).json({ listings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings", error });
  }
};

export const getListing = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    const currentUserId = getOptionalUserId(req);

    const query = `
      SELECT l.*, 
             CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END as is_saved
      FROM listings l
      LEFT JOIN saved_listings s ON l.id = s.listing_id AND s.user_id = $1
      WHERE l.id = $2
    `;

    const result = await pool.query(query, [currentUserId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const listing = await hydrateListingImages(result.rows[0]);
    res.status(200).json({ listing });
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
