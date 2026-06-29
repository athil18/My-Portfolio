import { createQueue, isRedisAvailable } from './config';
import { emailService } from '../services/external/email.service';

export const emailQueue = createQueue('email-queue');

export const addEmailJob = async (data: {
    type: 'verification' | 'password-reset' | 'order-confirmation' | 'password-reset-confirmation';
    payload: any;
}) => {
    if (!isRedisAvailable()) {
        console.warn(`🛡️ [SELF-HEALING] Redis is offline. Processing email job "${data.type}" synchronously.`);
        const { email, token, name, order } = data.payload;
        try {
            switch (data.type) {
                case 'verification':
                    await emailService.sendVerificationEmail(email, token, name);
                    break;
                case 'password-reset':
                    await emailService.sendPasswordResetEmail(email, token, name);
                    break;
                case 'password-reset-confirmation':
                    await emailService.sendPasswordResetConfirmation(email, name);
                    break;
                case 'order-confirmation':
                    await emailService.sendOrderConfirmationEmail(email, name, order);
                    break;
                default:
                    console.error(`Unknown email job type: ${data.type}`);
            }
            return;
        } catch (error) {
            console.error(`Synchronous fallback email delivery failed for "${data.type}":`, error);
            throw error;
        }
    }

    return emailQueue.add(data.type, data.payload);
};
