import { Router, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { stripeService } from '../../services/external/stripe.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/response';
import { httpStatus } from '../../utils/httpStatus';
import { supabaseAdmin } from '../../config/supabase';
import env from '../../config/env';

const router = Router();

/**
 * GET /api/v1/payments/config
 * Get Stripe Publishable Key
 */
router.get('/config', (req, res) => {
    res.json({
        publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    });
});

/**
 * POST /api/v1/payments/create-intent
 * Create a Stripe PaymentIntent
 */
router.post(
    '/create-intent',
    requireAuth,
    catchAsync(async (req: any, res: Response) => {
        const { orderId } = req.body;
        
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', req.user.id)
            .single();

        if (!order) {
            return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found', null);
        }

        const paymentIntent = await stripeService.createPaymentIntent(
            req.user.id,
            order.total_amount,
            'usd',
            { orderId: order.id }
        );

        await supabaseAdmin.from('transactions').insert({
            user_id: req.user.id,
            order_id: order.id,
            stripe_payment_id: paymentIntent.id,
            amount: order.total_amount,
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
