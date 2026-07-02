import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';
import { supabaseAdmin } from '../config/supabase';

export const getStats = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const stats = await dashboardService.getDashboardStats(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Stats fetched', stats);
});

export const getActivity = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const activity = await dashboardService.getRecentActivity(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Activity fetched', activity);
});

export const getSummary = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const summary = await dashboardService.getDashboardSummary(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Summary fetched', summary);
});

export const getEntityDetails = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { type, id } = req.params;

    if (!type || !id) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Type and ID are required');
    }

    let title = '';
    let metadata: Record<string, any> = {};
    let createdAt = new Date().toISOString();
    let updatedAt = new Date().toISOString();

    if (type === 'product') {
        const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
        if (!product) {
            return sendResponse(res, httpStatus.NOT_FOUND, false, 'Product not found');
        }
        title = product.title;
        metadata = {
            status: product.status,
            priority: product.priority || 'medium',
            category: product.category,
            price: product.price,
            stock: product.stock,
            tags: product.tags,
            description: product.description || 'No description provided.',
            sku: product.sku || 'N/A',
        };
        createdAt = product.created_at;
        updatedAt = product.updated_at;
    } else if (type === 'order') {
        let { data: order } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id).eq('user_id', req.user.id).single();
        if (!order) {
            const { data: adminUser } = await supabaseAdmin.from('profiles').select('role').eq('id', req.user.id).single();
            if (adminUser?.role === 'admin') {
                const { data: adminOrder } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id).single();
                if (!adminOrder) return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found');
                order = adminOrder;
            } else {
                return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found or unauthorized');
            }
        }
        
        title = `Order #${order.id}`;
        metadata = {
            status: order.status,
            priority: 'high',
            paymentStatus: order.payment_status,
            totalAmount: order.total_amount,
            itemsCount: order.order_items?.length || 0,
            shippingAddress: {
                line1: order.shipping_line1,
                city: order.shipping_city,
                state: order.shipping_state,
                country: order.shipping_country
            },
            items: order.order_items,
        };
        createdAt = order.created_at;
        updatedAt = order.updated_at;
    } else {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, `Unsupported entity type: ${type}`);
    }

    sendResponse(res, httpStatus.OK, true, 'Details fetched successfully', {
        id,
        type,
        title,
        metadata,
        createdAt,
        updatedAt,
    });
});
