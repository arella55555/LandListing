import { Router } from "express";

import { AdminController } from "../controllers/adminController";

import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = Router();

/**
 * AUTH + ROLE PROTECTION
 */

router.use(authenticateToken);

router.use(
  authorizeRoles("admin", "superadmin")
);

/**
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

router.get(
  "/dashboard",
  AdminController.dashboard
);

/**
 * ============================================================
 * USERS
 * ============================================================
 */

router.get(
  "/users",
  AdminController.users
);

router.patch(
  "/users/:id/suspend",
  AdminController.suspendUser
);

/**
 * ============================================================
 * LISTINGS
 * ============================================================
 */

router.get(
  "/listings",
  AdminController.listings
);

router.patch(
  "/listings/:id/approve",
  AdminController.approveListing
);

router.patch(
  "/listings/:id/reject",
  AdminController.rejectListing
);

/**
 * ============================================================
 * ADMIN LOGS
 * ============================================================
 */

router.get(
  "/logs",
  AdminController.logs
);

router.patch(
  "/users/:id/approve-seller",
  AdminController.approveSeller
);

router.patch(
  "/users/:id/reject-seller",
  AdminController.rejectSeller
);

router.patch(
  "/users/:id/unsuspend",
  AdminController.unsuspendUser
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;