import { Router } from 'express';
import multer from 'multer';
import { addListingImage, getImages, updateListingImage, deleteListingImage, uploadAndSave } from '../controllers/imageController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// multer memory storage so we can upload buffers directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public route 
router.get('/:listing_id', getImages);

// Protected routes
router.post('/', authenticateToken, authorizeRoles('seller', 'admin'), addListingImage);
// Upload file and optionally attach to listing_id (protected)
router.post('/upload', authenticateToken, authorizeRoles('seller', 'admin'), upload.single('file'), uploadAndSave);
router.put('/:id', authenticateToken, authorizeRoles('seller', 'admin'), updateListingImage);
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'admin'), deleteListingImage);

export default router;
