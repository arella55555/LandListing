import { Router } from 'express';
import {
  createListing,
  getAllListings,
  getListing,
  updateListing,
  deleteListing
} from '../controllers/listingController';

import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { requireVerification } from '../middleware/verifyMiddleware';

const router = Router();

// =====================
// Public routes
// =====================
router.get('/listings', getAllListings);
router.get('/listings/:id', getListing);

// =====================
// Protected routes (IMPORTANT FIX)
// =====================
router.post(
  '/post/listings',
  authenticateToken,
  authorizeRoles('seller', 'admin'),
  requireVerification,
  createListing
);

router.put(
  '/listings/:id',
  authenticateToken,
  authorizeRoles('seller', 'admin'),
  requireVerification,
  updateListing
);

router.delete(
  '/listings/:id',
  authenticateToken,
  authorizeRoles('seller', 'admin'),
  requireVerification,
  deleteListing
);

export default router;