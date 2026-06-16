import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/book', authenticate, TripController.bookLoad);
router.get('/', authenticate, TripController.list);
router.patch('/:id/status', authenticate, TripController.updateStatus);

export default router;
