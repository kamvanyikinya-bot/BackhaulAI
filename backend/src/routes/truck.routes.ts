import { Router } from 'express';
import { TruckController } from '../controllers/truck.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, TruckController.create);
router.get('/', authenticate, TruckController.list);
router.patch('/:id/status', authenticate, TruckController.updateStatus);

export default router;
