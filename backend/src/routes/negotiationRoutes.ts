import { Router } from 'express';
import { createNegotiation, getAllNegotiations, getNegotiationById, updateNegotiationStatus, deleteNegotiation} from '../controllers/negotiationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { requireVerification } from '../middleware/verifyMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('buyer'), requireVerification, createNegotiation);

router.get('/my-offers', getAllNegotiations);
router.get('/:id', getNegotiationById);

router.put('/:id', updateNegotiationStatus);

router.delete('/:id', authorizeRoles('admin'), deleteNegotiation);

export default router;
