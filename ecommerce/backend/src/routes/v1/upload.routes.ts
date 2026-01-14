import { Router } from 'express';
import * as uploadController from '../../controllers/upload.controller';
import { requireAuth } from '../../middleware/auth';
import { uploadSingle, uploadMultiple } from '../../middleware/uploadMiddleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// POST /api/v1/upload - Upload single file
router.post('/', uploadSingle, uploadController.uploadFile);

// POST /api/v1/upload/multiple - Upload multiple files
router.post('/multiple', uploadMultiple, uploadController.uploadMultipleFiles);

// GET /api/v1/upload/files - Get user's files
router.get('/files', uploadController.getFiles);

// GET /api/v1/upload/files/:id - Get file by ID
router.get('/files/:id', uploadController.getFileById);

// DELETE /api/v1/upload/files/:id - Delete file
router.delete('/files/:id', uploadController.deleteFile);

export default router;
