import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as orderService from '../services/order.service';
import { stripeService } from '../services/external/stripe.service';
import Order from '../models/order.model';
import Transaction from '../models/transaction.model';

export const handleWebhook = catchAsync(async (req: any, res: Response) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeService.verifyWebhookSignature(req.body, sig);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as any;
            await orderService.fulfillOrder(session.id);
            break;
        }

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as any;
            const { orderId } = paymentIntent.metadata;

            // Update Transaction
            await Transaction.findOneAndUpdate(
                { stripePaymentId: paymentIntent.id },
                {
                    status: 'succeeded',
                    paymentMethod: paymentIntent.payment_method,
                    receiptUrl: paymentIntent.charges?.data[0]?.receipt_url
                }
            );

            // Update Order if not already updated by session.completed
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && order.paymentStatus !== 'paid') {
                    order.paymentStatus = 'paid';
                    order.status = 'processing';
                    await order.save();
                }
            }
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as any;
            await Transaction.findOneAndUpdate(
                { stripePaymentId: paymentIntent.id },
                {
                    status: 'failed',
                    error: paymentIntent.last_payment_error?.message
                }
            );
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { shippingAddress } = req.body;
    if (!shippingAddress) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Shipping address required');

    const order = await orderService.createOrder(req.user.id, shippingAddress);
    sendResponse(res, httpStatus.CREATED, true, 'Order created successfully', order);
});

export const createCheckoutSession = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { shippingAddress } = req.body;
    if (!shippingAddress) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Shipping address required');

    const result = await orderService.createOrderFromCart(req.user.id, shippingAddress);
    sendResponse(res, httpStatus.OK, true, 'Checkout session created', result);
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await orderService.getUserOrders(req.user.id, page, limit);
    sendResponse(res, httpStatus.OK, true, 'Orders fetched', result);
});

export const getAllOrders = catchAsync(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await orderService.getAllOrders(page, limit);
    sendResponse(res, httpStatus.OK, true, 'All orders fetched', result);
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    sendResponse(res, httpStatus.OK, true, 'Order status updated', order);
});

// ... existing code ...
export const getOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    // If admin, they can see any order
    const order = req.user.role === 'admin'
        ? await Order.findById(req.params.id).populate('items.product').populate('user', 'name email')
        : await orderService.getOrderById(req.params.id, req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Order fetched', order);
});

export const payDemoOrder = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');

    // Simulate successful payment processing
    const order = await orderService.fulfillOrderByPaymentIntent(req.params.id);

    sendResponse(res, httpStatus.OK, true, 'Payment successful', order);
});
