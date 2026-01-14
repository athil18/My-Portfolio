import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireRole(['admin']));

router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.changeUserRole);
router.delete('/users/:userId', adminController.deleteUser);

export default router;
