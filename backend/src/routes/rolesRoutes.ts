import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware'; 
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.post('/buyer', 
  authenticateToken, 
  authorizeRoles('buyer', 'admin'), 
  (req, res) => res.json({ message: "You are a buyer" })
);

router.post('/seller', 
  authenticateToken, 
  authorizeRoles('seller', 'admin'), 
  (req, res) => res.json({ message: "You are a seller" })
);

router.get('/admin/panel', 
  authenticateToken, 
  authorizeRoles('admin'), 
  (req, res) => res.json({ message: "Welcome to the Admin Control Panel" })
);

export default router;
