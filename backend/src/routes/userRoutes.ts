import { Router } from 'express';
import { register, login, getUser, updateUser, deleteUser } from '../controllers/userController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

