import { createQueue } from './config';

export const emailQueue = createQueue('email-queue');

export const addEmailJob = (data: {
    type: 'verification' | 'password-reset' | 'order-confirmation' | 'password-reset-confirmation';
    payload: any;
}) => {
    return emailQueue.add(data.type, data.payload);
};
