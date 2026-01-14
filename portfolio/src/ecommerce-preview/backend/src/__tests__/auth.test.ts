import request from 'supertest';
import app from '../../app';

describe('Health Check', () => {
    it('GET /health should return status ok', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('env');
    });
});

describe('Auth Routes - Smoke Tests', () => {
    describe('POST /api/v1/auth/signup', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({ password: 'Test123!@#', name: 'Test User' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({ email: 'test@example.com', name: 'Test User' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({ email: 'test@example.com', password: 'Test123!@#' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should return 400 if credentials are missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
