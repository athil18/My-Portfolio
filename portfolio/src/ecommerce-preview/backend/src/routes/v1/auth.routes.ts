import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';
import { authLimiter, strictLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import {
    signupSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from '../../validators/auth.validator';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
