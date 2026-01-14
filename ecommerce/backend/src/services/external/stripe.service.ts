import Stripe from 'stripe';
import env from '../../config/env';
import { BaseExternalService } from './base.service';

class StripeService extends BaseExternalService {
    protected readonly serviceName = 'Stripe';
    private stripe: Stripe;

    constructor() {
        super();
        // Use validated environment variable (fail-fast if missing)
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        });
    }

    /**
     * Create a legacy checkout session (current implementation)
     */
    async createCheckoutSession(
        userId: string,
        items: Array<{ title: string; price: number; quantity: number }>,
        orderId: string
    ) {
        try {
            this.log('Creating checkout session', { userId, orderId });
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                client_reference_id: userId,
                metadata: { orderId },
                line_items: items.map((item) => ({
                    price_data: {
                        currency: 'usd',
                        product_data: { name: item.title },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                })),
                success_url: `${env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.FRONTEND_URL}/cart`,
            });
            return session;
        } catch (error) {
            this.handleError(error, 'createCheckoutSession');
        }
    }

    /**
     * Verify webhook signature using validated environment secret
     */
    verifyWebhookSignature(payload: string, signature: string) {
        try {
            return this.stripe.webhooks.constructEvent(
                payload,
                signature,
                env.STRIPE_WEBHOOK_SECRET // Use validated env
            );
        } catch (error) {
            this.handleError(error, 'verifyWebhookSignature');
        }
    }

    /**
     * Create a PaymentIntent for Elements-based checkout
     */
    async createPaymentIntent(
        userId: string,
        amount: number,
        currency: string = 'usd',
        metadata: Record<string, string> = {}
    ) {
        try {
            this.log('Creating PaymentIntent', { userId, amount });
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: { userId, ...metadata },
                automatic_payment_methods: { enabled: true },
            });

            return paymentIntent;
        } catch (error) {
            this.handleError(error, 'createPaymentIntent');
        }
    }

    /**
     * Refund a PaymentIntent
     */
    async refundPayment(paymentIntentId: string, amount?: number) {
        try {
            this.log('Refunding payment', { paymentIntentId, amount });
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
            });
            return refund;
        } catch (error) {
            this.handleError(error, 'refundPayment');
        }
    }

    /**
     * Get Stripe instance for advanced usage
     */
    get instance() {
        return this.stripe;
    }
}

export const stripeService = new StripeService();
