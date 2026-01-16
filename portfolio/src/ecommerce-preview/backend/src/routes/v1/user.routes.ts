import { Router } from 'express';
import * as userController from '../../controllers/user.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateMeSchema } from '../../validators/user.validator';

const router = Router();

router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, validate(updateMeSchema), userController.updateMe);

export default router;
