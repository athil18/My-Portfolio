import { Router } from 'express';
import * as productController from '../../controllers/product.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { productCreateSchema, productUpdateSchema, productQuerySchema } from '../../validators/product.validator';

const router = Router();

// Protected routes (All product routes are now private)
router.use(requireAuth);

router.get('/', validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.get('/:id/similar', productController.getSimilarProducts);

router.post('/', validate(productCreateSchema), productController.createProduct);
router.get('/user/me', productController.getMyProducts);
router.put('/:id', validate(productUpdateSchema), productController.updateProduct);
router.patch('/:id', validate(productUpdateSchema), productController.patchProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
