import { Router } from 'express';
import { KYCController } from '../controllers/kyc.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/submit', authenticate, KYCController.submit);
router.get('/status', authenticate, KYCController.getStatus);
router.get('/status/:userId', authenticate, KYCController.getStatus);
router.post('/verify', authenticate, KYCController.verify);

export default router;
