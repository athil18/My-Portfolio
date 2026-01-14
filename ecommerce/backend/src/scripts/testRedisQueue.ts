import { emailQueue } from '../queues/email.queue';
import mongoose from 'mongoose';
import env from '../config/env';

async function testQueue() {
    console.log('🧪 Starting Redis Queue Test...');

    try {
        // Add a test job to the email queue
        const testData = {
            email: 'test@example.com',
            token: 'test-token-123',
            name: 'Test User'
        };

        const job = await emailQueue.add('verification', testData);
        console.log(`✅ Test job added to queue with ID: ${job.id}`);

        console.log('⏳ Waiting for worker to process (watch the backend terminal logs)...');

        // Give it a few seconds then check status
        setTimeout(async () => {
            const status = await job.getState();
            console.log(`📊 Job Execution Status: ${status}`);
            process.exit(0);
        }, 5000);

    } catch (error) {
        console.error('❌ Queue test failed:', error);
        process.exit(1);
    }
}

testQueue();
