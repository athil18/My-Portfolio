import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';
import Product from '../models/product.model';
import Order from '../models/order.model';
import User from '../models/user.model';

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
        const product = await Product.findById(id);
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
        createdAt = product.createdAt.toISOString();
        updatedAt = product.updatedAt.toISOString();
    } else if (type === 'order') {
        const order = await Order.findOne({ _id: id, user: req.user.id });
        if (!order) {
            const adminUser = await User.findById(req.user.id);
            if (adminUser?.role === 'admin') {
                const adminOrder = await Order.findById(id);
                if (!adminOrder) return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found');
                title = `Order #${adminOrder._id}`;
                metadata = {
                    status: adminOrder.status,
                    priority: 'high',
                    paymentStatus: adminOrder.paymentStatus,
                    totalAmount: adminOrder.totalAmount,
                    itemsCount: adminOrder.items.length,
                    shippingAddress: adminOrder.shippingAddress,
                    items: adminOrder.items,
                };
                createdAt = adminOrder.createdAt.toISOString();
                updatedAt = adminOrder.updatedAt.toISOString();
            } else {
                return sendResponse(res, httpStatus.NOT_FOUND, false, 'Order not found or unauthorized');
            }
        } else {
            title = `Order #${order._id}`;
            metadata = {
                status: order.status,
                priority: 'high',
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                itemsCount: order.items.length,
                shippingAddress: order.shippingAddress,
                items: order.items,
            };
            createdAt = order.createdAt.toISOString();
            updatedAt = order.updatedAt.toISOString();
        }
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
