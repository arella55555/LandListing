import { Router } from 'express';
import { addListingImage, getImages, updateListingImage, deleteListingImage } from '../controllers/imageController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Public route 
router.get('/:listing_id', getImages);

// Protected routes
router.post('/', authenticateToken, authorizeRoles('seller', 'admin'), addListingImage);
router.put('/:id', authenticateToken, authorizeRoles('seller', 'admin'), updateListingImage);
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'admin'), deleteListingImage);

export default router;
