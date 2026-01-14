import { Router } from 'express';
import * as dashboardController from '../../controllers/dashboard.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/summary', dashboardController.getSummary);

export default router;
