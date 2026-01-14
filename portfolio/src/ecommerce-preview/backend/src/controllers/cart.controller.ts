import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as cartService from '../services/cart.service';

export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const cart = await cartService.getCart(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Cart fetched', cart);
});

export const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { productId, quantity } = req.body;
    if (!productId) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Product ID required');
    const cart = await cartService.addToCart(req.user.id, productId, quantity || 1);
    sendResponse(res, httpStatus.OK, true, 'Item added to cart', cart);
});

export const updateCartItem = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Quantity required');
    const cart = await cartService.updateCartItem(req.user.id, productId, quantity);
    sendResponse(res, httpStatus.OK, true, 'Cart updated', cart);
});

export const removeFromCart = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { productId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, productId);
    sendResponse(res, httpStatus.OK, true, 'Item removed', cart);
});

export const clearCart = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const cart = await cartService.clearCart(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Cart cleared', cart);
});
