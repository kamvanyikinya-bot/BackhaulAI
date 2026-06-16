import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', SubscriptionController.getPlans);
router.get('/status', authenticate, SubscriptionController.getStatus);
router.get('/status/:userId', authenticate, SubscriptionController.getStatus);
router.post('/upgrade', authenticate, SubscriptionController.upgrade);
router.post('/cancel', authenticate, SubscriptionController.cancel);

export default router;
