import { Router } from "express";
import pool from "../config/db";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/listings", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT l.*, u.full_name AS seller_name
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      ORDER BY l.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

router.patch("/listings/:id/approve", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE listings SET status = 'active', updated_at = NOW() WHERE id = $1",
      [id]
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [null, "approve_listing", "listing", id]
    );

    res.json({ message: "Listing approved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to approve listing" });
  }
});

router.patch("/listings/:id/reject", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE listings SET status = 'rejected', updated_at = NOW() WHERE id = $1",
      [id]
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [null, "reject_listing", "listing", id]
    );

    res.json({ message: "Listing rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject listing" });
  }
});

router.patch("/users/:id/suspend", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE users SET is_verified = false WHERE id = $1",
      [id]
    );

    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      ["system", "suspend_user", "user", id]
    );

    res.json({ message: "User suspended" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM admin_logs
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;