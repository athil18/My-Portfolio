import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as productService from '../services/product.service';

export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const product = await productService.createProduct(req.user.id, req.body);
    sendResponse(res, httpStatus.CREATED, true, 'Product created', product);
});

export const getProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await productService.getProducts(req.query as any);
    sendResponse(res, httpStatus.OK, true, 'Products fetched', result);
});

export const getProductById = catchAsync(async (req: AuthRequest, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    sendResponse(res, httpStatus.OK, true, 'Product fetched', product);
});

export const getMyProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await productService.getUserProducts(req.user.id, req.query as any);
    sendResponse(res, httpStatus.OK, true, 'Products fetched', result);
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const product = await productService.updateProduct(req.params.id, req.user.id, req.body);
    sendResponse(res, httpStatus.OK, true, 'Product updated', product);
});

export const patchProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const product = await productService.patchProduct(req.params.id, req.user.id, req.body);
    sendResponse(res, httpStatus.OK, true, 'Product patched', product);
});

export const deleteProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await productService.deleteProduct(req.params.id, req.user.id);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const getCategories = catchAsync(async (req: AuthRequest, res: Response) => {
    const categories = await productService.getCategories();
    sendResponse(res, httpStatus.OK, true, 'Categories fetched', { categories });
});

export const getSimilarProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const products = await productService.getSimilarProducts(req.params.id, Number(req.query.limit) || 5);
    sendResponse(res, httpStatus.OK, true, 'Similar products fetched', products);
});
