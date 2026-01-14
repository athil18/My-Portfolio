import { z } from 'zod';

export const productCreateSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title cannot exceed 200 characters'),
    description: z.string()
        .max(5000, 'Description cannot exceed 5000 characters')
        .optional(),
    price: z.number()
        .min(0, 'Price cannot be negative'),
    compareAtPrice: z.number()
        .min(0, 'Compare price cannot be negative')
        .optional(),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    category: z.string()
        .min(1, 'Category is required'),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    stock: z.number()
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative')
        .optional(),
    sku: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
}).strict();

export const productUpdateSchema = productCreateSchema.partial();

export const productQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'price', 'priority', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).strict();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
