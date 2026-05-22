import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createReview = async (req: Request, res: Response) => {
    try {
        const reviewer_id = req.user?.id;
        const { listing_id, rating, comment } = req.body;

        const result = await pool.query (
            `INSERT INTO reviews (listing_id, rating, comment) 
            VALUES ($1, $2, $3) RETURNING *`, [listing_id, rating, comment]
        )
    }
}