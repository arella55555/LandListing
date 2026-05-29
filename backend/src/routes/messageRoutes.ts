import { Router } from 'express';
import { sendMessage, getChatHistoryByNegotiationId, deleteMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.post('/', sendMessage);
router.get('/history/:negotiation_id', getChatHistoryByNegotiationId);
router.delete('/:id', deleteMessage);

export default router;
