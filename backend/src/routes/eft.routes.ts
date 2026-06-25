import { Router } from 'express';
import { EftController } from '../controllers/eft.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/bank-details', authenticate, EftController.getBankDetails);
router.post('/initiate', authenticate, EftController.initiate);
router.get('/list', authenticate, EftController.list);
router.post('/verify/:paymentId', authenticate, EftController.verify);

export default router;
