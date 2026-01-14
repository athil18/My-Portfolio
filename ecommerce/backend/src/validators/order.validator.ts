import { z } from 'zod';

export const createOrderSchema = z.object({
    shippingAddress: z.object({
        line1: z.string().min(1, 'Street address is required'),
        line2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
        country: z.string().min(1, 'Country is required'),
    }),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
}).strict();
