import { Router } from 'express';
import * as settingsController from '../../controllers/settings.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.patch('/password', requireAuth, settingsController.changePassword);
router.patch('/notifications', requireAuth, settingsController.updateNotifications);
router.get('/sessions', requireAuth, settingsController.getSessions);
router.post('/export-data', requireAuth, settingsController.exportData);
router.delete('/account', requireAuth, settingsController.deleteAccount);
router.post('/resend-verification', settingsController.resendVerification);

export default router;
