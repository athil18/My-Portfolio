import { Router } from 'express';
import * as analyticsController from '../../controllers/analytics.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Track event - public (handles its own auth inside if user is logged in)
// We use a middleware that optionally attaches user if token exists, 
// but doesn't block if it's a guest
router.post('/event', analyticsController.logEvent);

// Admin stats
router.get('/stats', requireAuth, requireRole(['admin']), analyticsController.getStats);

export default router;
