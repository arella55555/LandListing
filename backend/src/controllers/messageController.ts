import { Request, Response } from 'express';
import pool from '../config/db';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const sender_id = req.user?.id;
    const { negotiation_id, content, message_type, offer_amount } = req.body;

    if (!negotiation_id || !content || !message_type) {
      return res.status(400).json({ message: "Negotiation ID, content, and message type are required." });
    }

    if (['offer', 'counter_offer'].includes(message_type) && !offer_amount) {
      return res.status(400).json({ message: "An offer amount is required for offer or counter-offer message types." });
    }

    const roomCheck = await pool.query(
      'SELECT buyer_id, seller_id FROM negotiations WHERE id = $1',
      [negotiation_id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: "Negotiation room channel not found." });
    }

    const room = roomCheck.rows[0];
    if (room.buyer_id !== sender_id && room.seller_id !== sender_id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You are not a participant in this negotiation." });
    }

    const result = await pool.query(
      `INSERT INTO messages (negotiation_id, sender_id, content, message_type, offer_amount) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        negotiation_id, 
        sender_id, 
        content, 
        message_type, 
        ['offer', 'counter_offer'].includes(message_type) ? offer_amount : null
      ]
    );

    res.status(201).json({ message: "Message sent successfully", chatMessage: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

export const getChatHistoryByNegotiationId = async (req: Request, res: Response) => {
  try {
    const { negotiation_id } = req.params;
    const currentUserId = req.user?.id;

    const roomCheck = await pool.query(
      'SELECT buyer_id, seller_id FROM negotiations WHERE id = $1',
      [negotiation_id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ message: "Negotiation chat room not found." });
    }

    const room = roomCheck.rows[0];
    if (room.buyer_id !== currentUserId && room.seller_id !== currentUserId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. Access denied to this chat room." });
    }

    const result = await pool.query(
      `SELECT m.*, u.full_name as sender_name 
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.negotiation_id = $1 
       ORDER BY m.sent_at ASC`,
      [negotiation_id]
    );

    res.status(200).json({ history: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat log history", error });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const currentUserId = req.user?.id;
    const role = req.user?.role;

    const messageCheck = await pool.query('SELECT sender_id FROM messages WHERE id = $1', [id]);
    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (messageCheck.rows[0].sender_id !== currentUserId && role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. You cannot delete someone else's message." });
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error removing message", error });
  }
};
