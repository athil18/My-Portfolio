import { Router } from 'express';
import * as twoFactorController from '../../controllers/twoFactor.controller';
import * as sessionController from '../../controllers/session.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// 2FA routes
router.post('/2fa/setup', requireAuth, twoFactorController.setup2FA);
router.post('/2fa/verify-setup', requireAuth, twoFactorController.verifySetup);
router.post('/2fa/verify-login', twoFactorController.verifyLogin);
router.post('/2fa/disable', requireAuth, twoFactorController.disable2FA);

// Session routes
router.get('/sessions', requireAuth, sessionController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, sessionController.deleteSession);
router.delete('/sessions', requireAuth, sessionController.deleteAllSessions);

export default router;
