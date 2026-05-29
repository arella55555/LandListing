import pool from "../config/db";

class AdminService {

  // =========================================
  // DASHBOARD
  // =========================================

  static async getDashboardStats() {
  const [
    totalUsers,
    totalListings,
    pendingListings,
    approvedListings,
    suspendedUsers,
    verifiedUsers,
    adminUsers,
    fraudReports,
    flaggedListings,
    openReports,
    recentListings,
    recentLogs,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users`),

    pool.query(`SELECT COUNT(*) FROM listings`),

    pool.query(`
      SELECT COUNT(*) FROM listings
      WHERE moderation_status = 'pending'
    `),

    pool.query(`
      SELECT COUNT(*) FROM listings
      WHERE moderation_status = 'approved'
    `),

    pool.query(`
      SELECT COUNT(*) FROM users
      WHERE is_suspended = true
    `),

    pool.query(`
      SELECT COUNT(*) FROM users
      WHERE is_verified = true
    `),

    pool.query(`
      SELECT COUNT(*) FROM users
      WHERE role IN ('admin', 'superadmin')
    `),

    pool.query(`
      SELECT COUNT(*) FROM listing_reports
      WHERE reason ILIKE '%fraud%'
    `),

    pool.query(`
      SELECT COUNT(*) FROM listings
      WHERE moderation_status = 'flagged'
    `),

    pool.query(`
      SELECT COUNT(*) FROM listing_reports
      WHERE status = 'open'
    `),

    pool.query(`
      SELECT l.id, l.title, l.price, l.created_at
      FROM listings l
      ORDER BY l.created_at DESC
      LIMIT 5
    `),

    pool.query(`
      SELECT *
      FROM admin_logs
      ORDER BY created_at DESC
      LIMIT 10
    `),
  ]);

  return {
    stats: {
      totalUsers: Number(totalUsers.rows[0].count),
      totalListings: Number(totalListings.rows[0].count),
      pendingListings: Number(pendingListings.rows[0].count),
      approvedListings: Number(approvedListings.rows[0].count),
      suspendedUsers: Number(suspendedUsers.rows[0].count),
      verifiedUsers: Number(verifiedUsers.rows[0].count),
      admins: Number(adminUsers.rows[0].count),
    },

    alerts: {
      fraudReports: Number(fraudReports.rows[0].count),
      flaggedListings: Number(flaggedListings.rows[0].count),
      openReports: Number(openReports.rows[0].count),
    },

    recentListings: recentListings.rows,

    activity: recentLogs.rows,
  };
}


  // =========================================
  // USERS
  // =========================================

  static async getUsers() {

  const result = await pool.query(`
    SELECT 
      id,
      full_name,
      email,
      role,
      is_verified,
      is_suspended,
      seller_verification_status,
      buyer_verification_status,
      created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
}

  static async approveSeller(
  userId: string,
  adminId: string
) {

  await pool.query(`
    UPDATE users
    SET
      role='seller',
      seller_verification_status='approved',
      is_verified=true
    WHERE id=$1
  `, [userId]);

  await this.logAction(
    adminId,
    "approve_seller",
    "user",
    userId
  );

  return {
    message:
      "Seller approved successfully",
  };
}

static async rejectSeller(
  userId: string,
  adminId: string
) {

  await pool.query(`
    UPDATE users
    SET
      seller_verification_status='rejected'
    WHERE id=$1
  `, [userId]);

  await this.logAction(
    adminId,
    "reject_seller",
    "user",
    userId
  );

  return {
    message:
      "Seller rejected",
  };
}

static async unsuspendUser(
  userId: string,
  adminId: string
) {

  await pool.query(`
    UPDATE users
    SET is_suspended=false
    WHERE id=$1
  `, [userId]);

  await this.logAction(
    adminId,
    "unsuspend_user",
    "user",
    userId
  );

  return {
    message:
      "User unsuspended",
  };
}

  // =========================================
  // LISTINGS
  // =========================================

  static async getListings() {
  const result = await pool.query(`
    SELECT
      l.*,
      u.full_name AS seller_name,
      c.name AS property_type,

      (
        SELECT image_url
        FROM listing_images li
        WHERE li.listing_id = l.id
        AND li.is_primary = true
        LIMIT 1
      ) AS image

    FROM listings l

    JOIN users u ON u.id = l.seller_id
    JOIN categories c ON c.id = l.category_id

    ORDER BY l.created_at DESC
  `);

  return result.rows;
}

static async flagListing(listingId: string, adminId: string) {
  await pool.query(`
    UPDATE listings
    SET
      moderation_status = 'flagged',
      flagged_reason = 'Flagged by admin',
      updated_at = NOW()
    WHERE id = $1
  `, [listingId]);

  await this.logAction(
    adminId,
    "flag_listing",
    "listing",
    listingId
  );

  return {
    message: "Listing flagged"
  };
}

static async revertListing(
  listingId: string,
  adminId: string
) {

  await pool.query(`
    UPDATE listings
    SET
      moderation_status = 'pending',
      updated_at = NOW()
    WHERE id = $1
  `, [listingId]);

  await this.logAction(
    adminId,
    "revert_listing",
    "listing",
    listingId
  );

  return {
    message: "Listing reverted to pending"
  };
}

  // =========================================
  // APPROVE LISTING
  // =========================================

  static async approveListing(listingId: string, adminId: string) {
  await pool.query(`
    UPDATE listings
    SET
      moderation_status = 'approved',
      approved_by = $1,
      approved_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
  `, [adminId, listingId]);

  await this.logAction(
    adminId,
    "approve_listing",
    "listing",
    listingId
  );

  return { message: "Listing approved" };
}

  // =========================================
  // REJECT LISTING
  // =========================================

  static async rejectListing(listingId: string, adminId: string) {
  await pool.query(`
    UPDATE listings
    SET
      moderation_status = 'rejected',
      rejected_by = $1,
      rejected_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
  `, [adminId, listingId]);

  await this.logAction(
    adminId,
    "reject_listing",
    "listing",
    listingId
  );

  return { message: "Listing rejected" };
}



  // =========================================
  // SUSPEND USER
  // =========================================

  static async suspendUser(
    userId: string,
    adminId: string
  ) {

    await pool.query(`
      UPDATE users
      SET is_suspended=true
      WHERE id=$1
    `, [userId]);

    await this.logAction(
      adminId,
      "suspend_user",
      "user",
      userId
    );

    return {
      message: "User suspended",
    };
  }

  // =========================================
  // LOGS
  // =========================================

  static async getLogs() {

  const result = await pool.query(`
    SELECT
      admin_logs.*,
      users.full_name AS admin_name

    FROM admin_logs

    LEFT JOIN users
    ON admin_logs.admin_id = users.id

    ORDER BY admin_logs.created_at DESC
  `);

  return result.rows;
}
  // =========================================
  // LOG ACTION
  // =========================================

  static async logAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string
  ) {

    await pool.query(`
      INSERT INTO admin_logs (
        admin_id,
        action,
        target_type,
        target_id
      )
      VALUES ($1, $2, $3, $4)
    `, [
      adminId,
      action,
      targetType,
      targetId
    ]);
  }
}

export default AdminService;