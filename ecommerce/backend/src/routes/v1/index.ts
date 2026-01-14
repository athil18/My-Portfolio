import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import dashboardRoutes from './dashboard.routes';
import settingsRoutes from './settings.routes';
import securityRoutes from './security.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import exportRoutes from './export.routes';
import paymentRoutes from './payment.routes';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/security', securityRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);
router.use('/payments', paymentRoutes);

export default router;
