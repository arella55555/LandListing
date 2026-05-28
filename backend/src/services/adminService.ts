import pool from "../config/db";

class AdminService {

  // =========================================
  // DASHBOARD
  // =========================================

  static async getDashboardStats() {

  const totalUsers = await pool.query(`
    SELECT COUNT(*) FROM users
  `);

  const totalListings = await pool.query(`
    SELECT COUNT(*) FROM listings
  `);

  const approvedListings = await pool.query(`
  SELECT COUNT(*) FROM listings
  WHERE moderation_status='approved'
`);

const pendingListings = await pool.query(`
  SELECT COUNT(*) FROM listings
  WHERE moderation_status='pending'
`);
  const suspendedUsers = await pool.query(`
    SELECT COUNT(*) FROM users
    WHERE is_suspended=true
  `);

  const verifiedUsers = await pool.query(`
    SELECT COUNT(*) FROM users
    WHERE is_verified=true
  `);

  const admins = await pool.query(`
    SELECT COUNT(*) FROM users
    WHERE role IN ('admin', 'superadmin')
  `);

  return {

    totalUsers:
      Number(totalUsers.rows[0].count),

    totalListings:
      Number(totalListings.rows[0].count),

    pendingListings:
      Number(pendingListings.rows[0].count),

    approvedListings:
      Number(approvedListings.rows[0].count),

    suspendedUsers:
      Number(suspendedUsers.rows[0].count),

    verifiedUsers:
      Number(verifiedUsers.rows[0].count),

    admins:
      Number(admins.rows[0].count),
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