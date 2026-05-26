import { Router } from "express";
import { AdminController } from "../controllers/adminController";

const router = Router();

router.get(
  "/dashboard",
  AdminController.dashboard
);

router.get(
  "/users",
  AdminController.users
);

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

router.patch(
  "/users/:id/suspend",
  AdminController.suspendUser
);

router.get(
  "/logs",
  AdminController.logs
);

export default router;