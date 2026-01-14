import Stripe from 'stripe';
import config from '../config/env';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover' as any,
});

export const createCheckoutSession = async (
    userId: string,
    items: Array<{ title: string; price: number; quantity: number }>,
    orderId: string
) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: undefined, // Will be filled by client if needed or fetched from user
        client_reference_id: userId,
        metadata: {
            orderId,
        },
        line_items: items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        })),
        success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    return session;
};

export const verifyWebhookSignature = (payload: string, signature: string) => {
    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
    );
};
