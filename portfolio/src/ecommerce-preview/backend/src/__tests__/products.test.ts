import request from 'supertest';
import app from '../../app';

describe('Product Routes - Smoke Tests', () => {
    describe('GET /api/v1/products', () => {
        it('should return products list (public endpoint)', async () => {
            const response = await request(app)
                .get('/api/v1/products')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('data');
        });

        it('should support pagination parameters', async () => {
            const response = await request(app)
                .get('/api/v1/products?page=1&limit=10')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should support search parameter', async () => {
            const response = await request(app)
                .get('/api/v1/products?search=test')
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/products/:id', () => {
        it('should return 400 for invalid product ID format', async () => {
            const response = await request(app)
                .get('/api/v1/products/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/products', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .post('/api/v1/products')
                .send({
                    title: 'Test Product',
                    price: 99.99,
                    category: 'electronics',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});
