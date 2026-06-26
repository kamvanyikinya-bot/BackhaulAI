import { Router } from 'express';
import { AcquisitionController } from '../controllers/acquisition.controller';

const router = Router();

router.post('/leads', AcquisitionController.createLead);
router.get('/leads/stats', AcquisitionController.getStats);
router.post('/outreach/log', AcquisitionController.logOutreach);

export default router;
