import apiClient from './api';

export interface ShippingAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export const orderService = {
    createOrder: async (shippingAddress: ShippingAddress) => {
        return apiClient.post('/orders', { shippingAddress });
    },
    createCheckoutSession: async (shippingAddress: ShippingAddress) => {
        const response = await apiClient.post('/orders/checkout', { shippingAddress });
        return response.data;
    },

    getMyOrders: async (page = 1, limit = 10) => {
        return apiClient.get('/orders/my-orders', { params: { page, limit } });
    },

    getOrderById: async (id: string) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    getAdminOrders: async (page: number = 1) => {
        const response = await apiClient.get(`/orders/admin?page=${page}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: string) => {
        const response = await apiClient.patch(`/orders/${id}/status`, { status });
        return response.data;
    },
};
