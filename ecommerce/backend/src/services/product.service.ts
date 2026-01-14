import Product, { IProduct } from '../models/product.model';
import { AIService } from './ai.service';

interface ProductQuery {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const createProduct = async (userId: string, data: Partial<IProduct>) => {
    const product = await Product.create({ ...data, userId });
    return product;
};

export const getProducts = async (query: ProductQuery) => {
    const {
        page = 1,
        limit = 12,
        status,
        category,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (search) {
        filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limit).populate('userId', 'name email'),
        Product.countDocuments(filter),
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const getProductById = async (productId: string) => {
    const product = await Product.findById(productId).populate('userId', 'name email');
    if (!product) throw new Error('Product not found');
    return product;
};

export const getUserProducts = async (userId: string, query: ProductQuery) => {
    const { page = 1, limit = 12, status } = query;
    const filter: any = { userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(filter),
    ]);

    return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const updateProduct = async (productId: string, userId: string, data: Partial<IProduct>) => {
    const product = await Product.findOneAndUpdate(
        { _id: productId, userId },
        { $set: data },
        { new: true, runValidators: true }
    );
    if (!product) throw new Error('Product not found or unauthorized');
    return product;
};

export const patchProduct = async (productId: string, userId: string, data: Partial<IProduct>) => {
    // First check ownership
    const existing = await Product.findOne({ _id: productId, userId });
    if (!existing) throw new Error('Product not found or unauthorized');

    // Apply only provided fields
    Object.keys(data).forEach((key) => {
        if (data[key as keyof IProduct] !== undefined) {
            (existing as any)[key] = data[key as keyof IProduct];
        }
    });

    await existing.save();
    return existing;
};

export const deleteProduct = async (productId: string, userId: string, permanent = false) => {
    if (permanent) {
        const result = await Product.deleteOne({ _id: productId, userId });
        if (result.deletedCount === 0) throw new Error('Product not found or unauthorized');
    } else {
        const product = await Product.findOneAndUpdate(
            { _id: productId, userId },
            { isDeleted: true },
            { new: true }
        );
        if (!product) throw new Error('Product not found or unauthorized');
    }
    return { message: 'Product deleted' };
};

// ... existing interfaces ...

export const getSimilarProducts = async (productId: string, limit = 5) => {
    const targetProduct = await Product.findById(productId);
    if (!targetProduct) throw new Error('Product not found');

    // Fetch potential candidates (same category or active)
    const candidates = await Product.find({
        _id: { $ne: productId },
        status: 'active'
    }).limit(100); // Limit pool for performance

    return AIService.getSimilarProducts(targetProduct, candidates, limit);
};

export const getCategories = async () => {
    const categories = await Product.distinct('category', { status: 'active' });
    return categories;
};
