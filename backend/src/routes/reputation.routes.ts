import { Router } from 'express';
import { ReputationController } from '../controllers/reputation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, ReputationController.getReputation);
router.get('/:userId', authenticate, ReputationController.getReputation);
router.post('/update', authenticate, ReputationController.update);

export default router;
