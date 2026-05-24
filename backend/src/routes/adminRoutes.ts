import { Router } from 'express';
import { createAdminLog, getAllAdminLogs, getAdminLogById } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.post('/', createAdminLog);      
router.get('/', getAllAdminLogs);     
router.get('/:id', getAdminLogById);   

export default router;
