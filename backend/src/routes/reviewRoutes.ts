import { Router } from 'express';
import { createReview, getReviewsBySeller, updateReview, deleteReview } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { requireVerification } from '../middleware/verifyMiddleware';

const router = Router();

// Public route
router.get('/seller/:seller_id', getReviewsBySeller);

// Protected routes
router.post('/', authenticateToken, authorizeRoles('buyer', 'admin'), requireVerification, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
