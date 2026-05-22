import { Router } from "express";
import { createFavoritelisting, getAllFavoritelistings, getFavoriteListing, deleteFavoritelisting } from "../controllers/favoriteController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.post('/', createFavoritelisting);
router.get('/', getAllFavoritelistings);
router.get('/:id', getFavoriteListing);
router.delete('/:id', deleteFavoritelisting);

export default router;