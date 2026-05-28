import { Router } from "express";
import { login, signup, getCurrentUser } from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
