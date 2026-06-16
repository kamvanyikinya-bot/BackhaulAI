import { Router } from 'express';
import { DiscoveryController } from '../controllers/discovery.controller';

const router = Router();

router.post('/match-return', DiscoveryController.getMatches);
router.get('/stats', DiscoveryController.getStats);

export default router;
