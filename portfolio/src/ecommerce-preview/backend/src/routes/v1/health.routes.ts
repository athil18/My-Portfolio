import { Router } from 'express';
import * as healthController from '../../controllers/health.controller';

const router = Router();

router.get('/', healthController.checkHealth);
router.get('/ready', healthController.checkReady);

export default router;
