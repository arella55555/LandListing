import { Request, Response } from 'express';
import pool from '../config/db';

export const createFavoritelisting = async (req: Request, res: Response) => {
    try {
        const { listing_id } = req.body;
        const user_id = req.user?.id;

        if (!listing_id) {
            return res.status(400).json({ message: 'Listing ID required'});
        }
        
        const checkListing = await pool.query (`SELECT id FROM listings WHERE id = $1`, [listing_id]);
        if(checkListing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found'});
        }

        const result  = await pool.query (
            `INSERT INTO saved_listings (
                listing_id, user_id 
            ) VALUES ($1, $2) RETURNING *`, [listing_id, user_id]
        );
        
        res.status(201).json({ message: 'Listing successfully added to your favorites.', favorite: result.rows[0]});
    } catch(error: any) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "You have already saved this listing." });
        }
        res.status(500).json({ message: 'Error adding listing to favorites', error});
    }
};

export const getAllFavoritelistings = async (req: Request, res: Response) => {
    try {
        const user_id = req.user?.id;

        const result = await pool.query(
            `SELECT s.id AS saved_id, s.saved_at, l.* 
            FROM saved_listings s
            JOIN listings l ON s.listing_id = l.id
            WHERE s.user_id = $1
            ORDER BY s.saved_at DESC`,
            [user_id]
        );
    res.status(200).json({ favorites: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorited listings", error });
  }
};

export const getFavoriteListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const user_id = req.user?.id;
    const role = req.user?.role;

    const result = await pool.query(
      `SELECT s.id AS saved_id, s.saved_at, s.user_id AS bookmark_owner_id, l.* 
       FROM saved_listings s
       JOIN listings l ON s.listing_id = l.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Saved listing record not found." });
    }

    const savedItem = result.rows[0];

    if (savedItem.bookmark_owner_id !== user_id && role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. This bookmark does not belong to you." });
    }

    delete savedItem.bookmark_owner_id;

    res.status(200).json({ saved_listing: savedItem });
  } catch (error) {
    res.status(500).json({ message: "Error fetching individual saved listing.", error });
  }
};

export const deleteFavoritelisting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // The saved_listings table row UUID
        const user_id = req.user?.id;
        const role = req.user?.role;

        // Fetch the bookmark record to ensure the logged-in user actually owns it
        const bookmarkCheck = await pool.query('SELECT user_id FROM saved_listings WHERE id = $1', [id]);
        if (bookmarkCheck.rows.length === 0) {
        return res.status(404).json({ message: "Saved listing record not found." });
        }

        // Safety Block: Only the owner (or an admin) can delete this bookmark
        if (bookmarkCheck.rows[0].user_id !== user_id && role !== 'admin') {
        return res.status(403).json({ message: "Forbidden. You cannot remove someone else's saved listing." });
        }

        await pool.query('DELETE FROM saved_listings WHERE id = $1', [id]);
        res.status(200).json({ message: "Listing removed from favorites successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error removing saved listing.", error });
    }
};