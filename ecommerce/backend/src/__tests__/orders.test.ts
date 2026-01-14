import request from 'supertest';
import app from '../../app';

describe('Order Routes - Smoke Tests', () => {
    describe('POST /api/v1/orders', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .post('/api/v1/orders')
                .send({
                    shippingAddress: {
                        line1: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        postalCode: '12345',
                        country: 'US',
                    },
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('token');
        });
    });

    describe('GET /api/v1/orders/my-orders', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/v1/orders/my-orders')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/orders/:id', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/v1/orders/507f1f77bcf86cd799439011')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});

describe('Cart Routes - Smoke Tests', () => {
    describe('GET /api/v1/cart', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/v1/cart')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/cart/add', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app)
                .post('/api/v1/cart/add')
                .send({
                    productId: '507f1f77bcf86cd799439011',
                    quantity: 1,
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});
