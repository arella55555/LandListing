import { Router } from "express";
import { getProfile, getUser, getAllUsers, updateUser, deleteUser, verifyUserAccount } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticateToken, getProfile);
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);
router.post("/verify-account", authenticateToken, verifyUserAccount);

export default router;

