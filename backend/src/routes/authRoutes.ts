import { AuthController }
from "../controllers/AuthController";

import { Router } from "express";

import {
  authenticateToken,
} from "../middleware/authMiddleware";

const router = Router();
router.get(
  "/me",
  authenticateToken,
  AuthController.me
);
export default router;