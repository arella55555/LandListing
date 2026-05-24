import { Router } from 'express';
import { createAdminLog, getAllAdminLogs, getAdminLogById } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Completely lock down this entire router workspace to Admins only
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.post('/', createAdminLog);      // POST /api/admin-logs
router.get('/', getAllAdminLogs);       // GET /api/admin-logs
router.get('/:id', getAdminLogById);   // GET /api/admin-logs/:id

export default router;
