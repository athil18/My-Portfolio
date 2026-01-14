import { emailQueue } from '../queues/email.queue';
import { emailService } from '../services/external/email.service';
import { isRedisAvailable } from '../queues/config';

/**
 * Process email jobs with Redis fallback
 */
export const emailWorker = () => {
    try {
        // Check if Redis is available before setting up queue processing
        if (!isRedisAvailable()) {
            console.warn('📧 [EMAIL] Redis unavailable - emails will be processed synchronously');
            return;
        }

        emailQueue.process('verification', async (job) => {
            const { email, token, name } = job.data;
            await emailService.sendVerificationEmail(email, token, name);
        });

        emailQueue.process('password-reset', async (job) => {
            const { email, token, name } = job.data;
            await emailService.sendPasswordResetEmail(email, token, name);
        });

        emailQueue.process('order-confirmation', async (job) => {
            const { email, name, order } = job.data;
            await emailService.sendOrderConfirmationEmail(email, name, order);
        });

        emailQueue.process('password-reset-confirmation', async (job) => {
            const { email, name } = job.data;
            await emailService.sendPasswordResetConfirmation(email, name);
        });

        console.log('Email worker started');
    } catch (error) {
        console.warn('Email worker failed to start (Redis may be unavailable):', error);
    }
};
