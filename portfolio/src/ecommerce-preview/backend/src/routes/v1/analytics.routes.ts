import { Router } from 'express';
import * as analyticsController from '../../controllers/analytics.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

router.post('/event', analyticsController.logEvent);

router.get('/stats', requireAuth, requireRole(['admin']), analyticsController.getStats);

export default router;
