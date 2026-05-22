import { Router } from 'express';
import { createListing, getAllListings, getListing, updateListing, deleteListing } from '../controllers/listingController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Public routes 
router.get('/listings', getAllListings);
router.get('/listings/:id', getListing);

// Protected routes 
router.post('/post/listings', authenticateToken, authorizeRoles('seller', 'admin'), createListing);
router.put('/listings/:id', authenticateToken, authorizeRoles('seller', 'admin'), updateListing);
router.delete('/listings/:id', authenticateToken, authorizeRoles('seller', 'admin'), deleteListing);

export default router;
