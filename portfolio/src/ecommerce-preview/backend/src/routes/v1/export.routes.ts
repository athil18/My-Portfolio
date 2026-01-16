import { Router } from 'express';
import * as exportController from '../../controllers/export.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/:entity', exportController.exportData);

export default router;
