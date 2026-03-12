import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../models/User';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Product CRUD
router.post('/', authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR), productController.updateProduct);
router.delete('/:id', authorize(UserRole.OWNER, UserRole.ADMIN), productController.deleteProduct);

export default router;
