import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createReview = async (req: Request, res: Response) => {
    try {
        const reviewer_id = req.user?.id;
        const { listing_id, rating, comment } = req.body;

        
    }
}