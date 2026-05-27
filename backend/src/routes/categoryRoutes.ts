import { Router } from 'express';
import { createCategory, getAllCategories, getCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Public routes 
router.get('/category', getAllCategories);
router.get('/category/:id', getCategory);

// Protected routes 
router.post('/post/category', authenticateToken, authorizeRoles('admin'), createCategory);
router.put('/category/:id', authenticateToken, authorizeRoles('admin'), updateCategory);
router.delete('/category/:id', authenticateToken, authorizeRoles('admin'), deleteCategory);

export default router;
