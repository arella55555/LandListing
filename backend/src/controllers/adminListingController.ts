import pool from "../config/db";

export async function approveListing(req: any, res: any) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    await pool.query(`
      UPDATE listings
      SET
        status = 'approved',
        moderation_status = 'approved',
        approved_by = $1,
        approved_at = NOW()
      WHERE id = $2
    `, [adminId, id]);

    await pool.query(`
      INSERT INTO admin_logs (
        admin_id,
        action,
        target_type,
        target_id
      ) VALUES ($1, 'approve_listing', 'listing', $2)
    `, [adminId, id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
}