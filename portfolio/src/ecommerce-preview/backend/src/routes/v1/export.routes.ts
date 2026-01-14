import { Router } from 'express';
import * as exportController from '../../controllers/export.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// All export routes currently require admin role for safety
// In the future, individual entities could have their own permissions
router.use(requireAuth);
router.use(requireRole(['admin']));

// GET /api/v1/export/:entity - Export data (CSV/JSON)
router.get('/:entity', exportController.exportData);

export default router;
