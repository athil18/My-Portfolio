import { cleanEnv, str, port, url } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const env = cleanEnv(process.env, {
    // Server
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    PORT: port({ default: 5000 }),

    // Database
    DATABASE_URL: url(),

    // JWT Secrets
    JWT_SECRET: str({ desc: 'Secret key for access tokens' }),
    JWT_REFRESH_SECRET: str({ desc: 'Secret key for refresh tokens' }),

    // CORS & Frontend
    CORS_ORIGIN: url(),
    FRONTEND_URL: url({ default: 'http://localhost:5173' }),

    // SMTP / Email
    SMTP_HOST: str({ default: 'smtp.gmail.com' }),
    SMTP_PORT: port({ default: 587 }),
    SMTP_USER: str({ desc: 'SMTP username/email' }),
    SMTP_PASS: str({ desc: 'SMTP password or app password' }),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: str({ desc: 'Cloudinary cloud name' }),
    CLOUDINARY_API_KEY: str({ desc: 'Cloudinary API key' }),
    CLOUDINARY_API_SECRET: str({ desc: 'Cloudinary API secret' }),

    // Redis
    REDIS_URL: str({ default: 'redis://localhost:6379' }),

    // Stripe (CRITICAL: Now validated)
    STRIPE_SECRET_KEY: str({ desc: 'Stripe secret key (sk_live_* or sk_test_*)' }),
    STRIPE_PUBLISHABLE_KEY: str({ desc: 'Stripe publishable key (pk_test_*)', default: '' }),
    STRIPE_WEBHOOK_SECRET: str({ desc: 'Stripe webhook signing secret (whsec_*)' }),

    // Bull Board (Required in production for admin access)
    BULL_BOARD_USER: str({ default: 'admin', desc: 'Bull Board admin username' }),
    BULL_BOARD_PASSWORD: str({ desc: 'Bull Board admin password - REQUIRED' }),
});

// Fail-fast validation logging
console.log(`[ENV] Environment: ${env.NODE_ENV}`);
console.log(`[ENV] Stripe configured: ${env.STRIPE_SECRET_KEY.substring(0, 7)}...`);
console.log(`[ENV] Redis URL: ${env.REDIS_URL.split('@').pop() || env.REDIS_URL}`);

export default env;
