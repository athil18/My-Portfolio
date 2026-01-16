import { Router } from 'express';
import * as uploadController from '../../controllers/upload.controller';
import { requireAuth } from '../../middleware/auth';
import { uploadSingle, uploadMultiple } from '../../middleware/uploadMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', uploadSingle, uploadController.uploadFile);

router.post('/multiple', uploadMultiple, uploadController.uploadMultipleFiles);

router.get('/files', uploadController.getFiles);

router.get('/files/:id', uploadController.getFileById);

router.delete('/files/:id', uploadController.deleteFile);

export default router;
