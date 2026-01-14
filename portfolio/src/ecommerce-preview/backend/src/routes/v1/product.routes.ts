import { Router } from 'express';
import * as productController from '../../controllers/product.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { productCreateSchema, productUpdateSchema, productQuerySchema } from '../../validators/product.validator';

const router = Router();

// Public routes
router.get('/', validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.get('/:id/similar', productController.getSimilarProducts);

// Protected routes
router.post('/', requireAuth, validate(productCreateSchema), productController.createProduct);
router.get('/user/me', requireAuth, productController.getMyProducts);
router.put('/:id', requireAuth, validate(productUpdateSchema), productController.updateProduct);
router.patch('/:id', requireAuth, validate(productUpdateSchema), productController.patchProduct);
router.delete('/:id', requireAuth, productController.deleteProduct);

export default router;
