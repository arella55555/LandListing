import { Router } from 'express';
import { register, login, getUser, getAllUsers, updateUser, deleteUser, verifyUserAccount } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/verify-account', authenticateToken, verifyUserAccount);

export default router;

