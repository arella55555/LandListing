import { Router } from "express";
import { getProfile } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticateToken, getProfile);

export default router;
