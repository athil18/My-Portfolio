import { supabaseAdmin } from '../config/supabase';
import { AIService } from './ai.service';

/**
 * PRODUCT SERVICE — Supabase PostgreSQL Migration
 * Replaces Mongoose Product model with Supabase Client.
 */

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

export const createProduct = async (userId: string, data: any) => {
    const embedding = await AIService.generateProductEmbedding(data.title || '', data.description || '');
    const metadata = { ...data.metadata, ai_embedding: embedding };
    
    // In PostgreSQL, tags and images are text arrays
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .insert({
            user_id: userId,
            title: data.title,
            description: data.description,
            price: data.price,
            stock: data.stock,
            category: data.category,
            tags: data.tags || [],
            images: data.images || [],
            status: data.status || 'draft',
            metadata: metadata,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
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
        sortBy = 'created_at',
        sortOrder = 'desc',
    } = query;

    let supabaseQuery = supabaseAdmin
        .from('products')
        .select(`
            *,
            profiles:user_id (name, email)
        `, { count: 'exact' });

    if (status) supabaseQuery = supabaseQuery.eq('status', status);
    if (category) supabaseQuery = supabaseQuery.eq('category', category);
    if (minPrice !== undefined) supabaseQuery = supabaseQuery.gte('price', minPrice);
    if (maxPrice !== undefined) supabaseQuery = supabaseQuery.lte('price', maxPrice);
    
    if (search) {
        // Use the custom full-text search function if needed, or simple ilike for basic search
        supabaseQuery = supabaseQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Map Mongoose sortBy fields to Postgres (createdAt -> created_at)
    const orderColumn = sortBy === 'createdAt' ? 'created_at' : sortBy;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error, count } = await supabaseQuery
        .order(orderColumn, { ascending: sortOrder === 'asc' })
        .range(from, to);

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);

    // Map profiles -> userId to preserve API contract
    const formattedProducts = products.map((p: any) => ({
        ...p,
        userId: p.profiles ? { name: p.profiles.name, email: p.profiles.email } : p.user_id,
        profiles: undefined // remove the joined object to match old API
    }));

    return {
        products: formattedProducts,
        pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
        },
    };
};

export const getProductById = async (productId: string) => {
    const { data: product, error } = await supabaseAdmin
        .from('products')
        .select(`*, profiles:user_id (name, email)`)
        .eq('id', productId)
        .single();

    if (error || !product) throw new Error('Product not found');

    return {
        ...product,
        userId: product.profiles ? { name: product.profiles.name, email: product.profiles.email } : product.user_id,
        profiles: undefined
    };
};

export const getUserProducts = async (userId: string, query: ProductQuery) => {
    const { page = 1, limit = 12, status } = query;
    
    let supabaseQuery = supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    if (status) supabaseQuery = supabaseQuery.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error, count } = await supabaseQuery
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(`Failed to fetch user products: ${error.message}`);

    return { 
        products, 
        pagination: { 
            page, 
            limit, 
            total: count || 0, 
            pages: Math.ceil((count || 0) / limit) 
        } 
    };
};

export const updateProduct = async (productId: string, userId: string, data: any) => {
    const updateData = { ...data };

    if (data.title !== undefined || data.description !== undefined) {
        // Fetch existing first to get old title/description if only one is updated
        const { data: existing } = await supabaseAdmin
            .from('products')
            .select('title, description, metadata')
            .eq('id', productId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            const title = data.title !== undefined ? data.title : existing.title;
            const description = data.description !== undefined ? data.description : existing.description;
            const embedding = await AIService.generateProductEmbedding(title, description || '');
            updateData.metadata = { ...existing.metadata, ...data.metadata, ai_embedding: embedding };
        }
    }

    const { data: product, error } = await supabaseAdmin
        .from('products')
        .update({
            ...updateData,
            updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error || !product) throw new Error('Product not found or unauthorized');
    return product;
};

export const patchProduct = async (productId: string, userId: string, data: any) => {
    return updateProduct(productId, userId, data); // supabase update acts like patch (partial updates)
};

export const deleteProduct = async (productId: string, userId: string, permanent = false) => {
    if (permanent) {
        const { error, count } = await supabaseAdmin
            .from('products')
            .delete({ count: 'exact' })
            .eq('id', productId)
            .eq('user_id', userId);
            
        if (error || count === 0) throw new Error('Product not found or unauthorized');
    } else {
        const { error, data } = await supabaseAdmin
            .from('products')
            .update({ is_deleted: true })
            .eq('id', productId)
            .eq('user_id', userId)
            .select();
            
        if (error || !data || data.length === 0) throw new Error('Product not found or unauthorized');
    }
    return { message: 'Product deleted' };
};

export const getSimilarProducts = async (productId: string, limit = 5) => {
    // Requires pgvector setup for similarity search
    // For now, returning dummy or basic fetch since AI service handles the similarity
    const targetProduct = await getProductById(productId);
    
    // Simplistic fallback without pgvector direct query:
    const { data: candidates, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .neq('id', productId)
        .eq('status', 'active')
        .limit(100);

    if (error) throw new Error('Failed to fetch candidates');

    return AIService.getSimilarProducts(targetProduct, candidates || [], limit);
};

export const getCategories = async () => {
    // Emulate distinct category query
    // Supabase RPC or distinct is needed. For now, we can fetch unique categories manually if table is small,
    // or ideally create a view/rpc for it. We'll use a raw SQL-like approach if we had one, but we don't.
    // Fetching all active products categories and making them unique:
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('category')
        .eq('status', 'active');

    if (error) throw new Error('Failed to fetch categories');
    
    const categories = [...new Set(data.map((p: any) => p.category).filter(Boolean))];
    return categories;
};
