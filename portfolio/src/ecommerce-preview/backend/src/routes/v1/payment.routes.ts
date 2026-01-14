import { Router, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { stripeService } from '../../services/external/stripe.service';
import Order from '../../models/order.model';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { httpStatus } from '../../utils/httpStatus';
import TransactionModel from '../../models/transaction.model';

const router = Router();

/**
 * POST /api/v1/payments/create-intent
 * Create a Stripe PaymentIntent
 */
router.post(
    '/create-intent',
    requireAuth,
    catchAsync(async (req: any, res: Response) => {
        const { orderId } = req.body;
        const order = await Order.findOne({ _id: orderId, user: req.user.id });

        if (!order) {
            return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found', null);
        }

        const paymentIntent = await stripeService.createPaymentIntent(
            req.user.id,
            order.totalAmount,
            'usd',
            { orderId: order._id.toString() }
        );

        // Create a pending transaction record
        await TransactionModel.create({
            userId: req.user.id,
            orderId: order._id,
            stripePaymentId: paymentIntent.id,
            amount: order.totalAmount,
            currency: 'usd',
            status: 'pending',
        });

        res.json({
            success: true,
            clientSecret: paymentIntent?.client_secret,
        });
    })
);

export default router;
