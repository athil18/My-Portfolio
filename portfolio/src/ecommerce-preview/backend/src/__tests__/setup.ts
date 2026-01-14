import mongoose from 'mongoose';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only';
process.env.DATABASE_URL = 'mongodb://127.0.0.1:27017/premium-purchases-test'; // Use IP to avoid localhost resolution issues
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test-password';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
    // Close mongoose connection if open
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});
