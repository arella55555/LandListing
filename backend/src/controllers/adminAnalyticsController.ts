import pool from "../config/db";

/**
 * ============================================================
 * ADMIN DASHBOARD ANALYTICS CONTROLLER
 * REAL DATA ONLY (NO PLACEHOLDERS)
 * ============================================================
 */

export async function getDashboardStats(req: any, res: any) {
  try {
    /**
     * ============================================================
     * CORE LISTING STATS
     * ============================================================
     */
    const listingsStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_listings,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_listings,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_listings,
        COUNT(*) FILTER (WHERE is_featured = true) AS featured_listings,
        COUNT(*) AS total_listings
      FROM listings;
    `);

    /**
     * ============================================================
     * USER STATS
     * ============================================================
     */
    const userStats = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE is_suspended = true) AS suspended_users,
        COUNT(*) FILTER (
          WHERE seller_verification_status = 'verified'
        ) AS verified_sellers,
        COUNT(*) FILTER (WHERE role = 'seller') AS total_sellers,
        COUNT(*) FILTER (WHERE role = 'buyer') AS total_buyers
      FROM users;
    `);

    /**
     * ============================================================
     * REPORTS / FLAGS (FROM LISTINGS)
     * ============================================================
     */
    const alertStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE flagged_reason IS NOT NULL) AS flagged_listings,
        COUNT(*) FILTER (WHERE status = 'pending') AS open_reports
      FROM listings;
    `);

    /**
     * ============================================================
     * RECENT LISTINGS (MODERATION QUEUE)
     * ============================================================
     */
    const recentListings = await pool.query(`
      SELECT
        l.id,
        l.title,
        l.price,
        l.status,
        l.created_at,
        l.barangay,
        l.municipality,
        l.province,
        u.full_name AS seller_name
      FROM listings l
      LEFT JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'pending'
      ORDER BY l.created_at DESC
      LIMIT 10;
    `);

    /**
     * ============================================================
     * RECENT ADMIN ACTIVITY LOGS
     * ============================================================
     */
    const activity = await pool.query(`
      SELECT *
      FROM admin_logs
      ORDER BY created_at DESC
      LIMIT 15;
    `);

    /**
     * ============================================================
     * DAILY ANALYTICS (FOR CHARTS)
     * ============================================================
     */
    const listingTrend = await pool.query(`
      SELECT
        date,
        total_listings,
        pending_listings,
        approved_listings,
        rejected_listings,
        flagged_listings
      FROM listing_daily_stats
      ORDER BY date DESC
      LIMIT 14;
    `);

    const userTrend = await pool.query(`
      SELECT
        date,
        total_users,
        active_users,
        verified_sellers,
        suspended_users
      FROM user_daily_stats
      ORDER BY date DESC
      LIMIT 14;
    `);

    /**
     * ============================================================
     * RESPONSE
     * ============================================================
     */
    return res.json({
      stats: listingsStats.rows[0],
      users: userStats.rows[0],
      alerts: alertStats.rows[0],
      recentListings: recentListings.rows,
      activity: activity.rows,
      trends: {
        listings: listingTrend.rows.reverse(),
        users: userTrend.rows.reverse(),
      },
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    return res.status(500).json({
      error: "Failed to load dashboard analytics",
    });
  }
}