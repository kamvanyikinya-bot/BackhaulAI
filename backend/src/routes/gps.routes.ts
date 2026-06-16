import { Router } from 'express';
import { GPSController } from '../controllers/gps.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/location', authenticate, GPSController.postLocation);
router.get('/latest/:tripId', authenticate, GPSController.getLatest);

export default router;
