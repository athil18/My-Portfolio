import { z } from 'zod';

export const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().min(0),
    })).min(1, 'Order must have at least one item'),
    shippingAddress: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().min(1, 'Zip code is required'),
        country: z.string().min(1, 'Country is required'),
    }),
    paymentMethod: z.string().optional(),
}).strict();

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
}).strict();
