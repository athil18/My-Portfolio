import { Router } from 'express';
import * as notificationController from '../../controllers/notification.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// POST /api/v1/notifications - Create notification (admin only)
router.post('/', requireRole(['admin']), notificationController.createNotification);

// GET /api/v1/notifications - Get user's notifications
router.get('/', notificationController.getNotifications);

// GET /api/v1/notifications/unread-count - Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read - Mark as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
