import { Request, Response } from "express";
import pool from "../config/db";

export class AuthController {

  static async me(req: any, res: Response) {

    try {

      const result = await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          role,
          is_verified
        FROM users
        WHERE id = $1
        `,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        user: result.rows[0],
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
}