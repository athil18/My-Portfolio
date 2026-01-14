import express, { Router } from 'express';
import * as orderController from '../../controllers/order.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

import { validate } from '../../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../../validators/order.validator';

const router = Router();

// Webhook must be before requireAuth and use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.handleWebhook);

router.use(requireAuth);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.post('/checkout', validate(createOrderSchema), orderController.createCheckoutSession);
router.get('/my-orders', orderController.getMyOrders);
router.get('/admin', requireRole(['admin']), orderController.getAllOrders);
router.patch('/:id/status', requireRole(['admin']), validate(updateOrderStatusSchema), orderController.updateOrderStatus);
router.get('/:id', orderController.getOrderById);

export default router;
