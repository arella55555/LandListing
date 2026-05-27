import { Request, Response } from 'express';
import pool from '../config/db';

export const createNegotiation = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user?.id; 
    const { listing_id, asking_price } = req.body;

    if (!listing_id || !asking_price) {
      return res.status(400).json({ message: "Listing ID and asking price are required." });
    }

    const listingCheck = await pool.query(
      'SELECT seller_id, price, negotiable, status FROM listings WHERE id = $1', 
      [listing_id]
    );

    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const listing = listingCheck.rows[0];

    if (!listing.negotiable || listing.status !== 'active') {
      return res.status(400).json({ message: "This listing is closed for negotiations or inactive." });
    }

    if (listing.seller_id === buyer_id) {
      return res.status(400).json({ message: "You cannot initiate a negotiation on your own listing." });
    }

    const result = await pool.query(
      `INSERT INTO negotiations (listing_id, buyer_id, seller_id, asking_price, status) 
       VALUES ($1, $2, $3, $4, 'open') 
       RETURNING *`,
      [listing_id, buyer_id, listing.seller_id, asking_price]
    );

    res.status(201).json({ message: "Negotiation channel opened.", negotiation: result.rows[0] });
  } catch (error: any) {

    if (error.code === '23505') {
      return res.status(400).json({ message: "You already have an open negotiation channel for this listing." });
    }
    res.status(500).json({ message: "Error opening negotiation channel.", error });
  }
};

export const getAllNegotiations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let query = '';
    let params: any[] = [userId];

    if (role === 'admin') {
      query = 'SELECT * FROM negotiations ORDER BY updated_at DESC';
      params = [];
    } else if (role === 'seller') {
      query = 'SELECT * FROM negotiations WHERE seller_id = $1 ORDER BY updated_at DESC';
    } else {
      query = 'SELECT * FROM negotiations WHERE buyer_id = $1 ORDER BY updated_at DESC';
    }

    const result = await pool.query(query, params);
    res.status(200).json({ negotiations: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching negotiations.", error });
  }
};

export const getNegotiationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Negotiation record not found." });
    }

    const negotiation = result.rows[0];

    if (role !== 'admin' && negotiation.buyer_id !== userId && negotiation.seller_id !== userId) {
      return res.status(403).json({ message: "Forbidden. Access denied to this negotiation." });
    }

    res.status(200).json({ negotiation });
  } catch (error) {
    res.status(500).json({ message: "Error fetching negotiation data.", error });
  }
};

export const updateNegotiationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, final_price } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    const checkRecord = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);
    if (checkRecord.rows.length === 0) {
      return res.status(404).json({ message: "Negotiation not found." });
    }

    const negotiation = checkRecord.rows[0];

    if (status === 'withdrawn') {
      if (negotiation.buyer_id !== userId && role !== 'admin') {
        return res.status(403).json({ message: "Only the buyer can withdraw their offer." });
      }
    } else if (['accepted', 'rejected', 'completed'].includes(status)) {
      if (negotiation.seller_id !== userId && role !== 'admin') {
        return res.status(403).json({ message: "Only the seller can accept, reject, or complete this deal." });
      }
    }

    const result = await pool.query(
      `UPDATE negotiations 
       SET status = COALESCE($1, status),
           final_price = COALESCE($2, final_price),
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status || null, final_price || null, id]
    );

    res.status(200).json({ message: `Negotiation status updated to ${status}.`, negotiation: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error modifying negotiation.", error });
  }
};

export const deleteNegotiation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user?.role;

    if (role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. Only an administrator can hard-delete deal histories." });
    }

    const result = await pool.query('DELETE FROM negotiations WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Negotiation history record missing." });
    }

    res.status(200).json({ message: "Negotiation deal logs purged successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record history.", error });
  }
};
