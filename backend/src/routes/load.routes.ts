import { Router } from 'express';
import { LoadController } from '../controllers/load.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, LoadController.create);
router.get('/', LoadController.list);
router.get('/:id', LoadController.getById);
router.delete('/:id', authenticate, LoadController.delete);

export default router;
