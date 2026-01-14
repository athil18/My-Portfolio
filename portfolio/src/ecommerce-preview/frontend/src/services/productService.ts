import apiClient from './api';

export interface Product {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    status: 'draft' | 'active' | 'archived';
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
    images: string[];
    stock: number;
    sku?: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    status?: 'draft' | 'active' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    category: string;
    tags?: string[];
    images?: string[];
    stock?: number;
    sku?: string;
}

export const productService = {
    createProduct: async (data: CreateProductData) => {
        const response = await apiClient.post('/products', data);
        return response.data;
    },

    getProducts: async (params?: any) => {
        const response = await apiClient.get('/products', { params });
        return response.data;
    },

    getProduct: async (id: string) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    getMyProducts: async (params?: any) => {
        const response = await apiClient.get('/products/user/me', { params });
        return response.data;
    },

    updateProduct: async (id: string, data: Partial<CreateProductData>) => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data;
    },

    patchProduct: async (id: string, data: Partial<CreateProductData>) => {
        const response = await apiClient.patch(`/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/products/categories');
        return response.data;
    },

    getSimilarProducts: async (id: string, limit = 4) => {
        const response = await apiClient.get(`/products/${id}/similar`, { params: { limit } });
        return response.data;
    },
};
