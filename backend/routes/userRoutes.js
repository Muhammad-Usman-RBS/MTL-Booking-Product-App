import express from 'express';
import {
  createUserBySuperAdmin,
  getClientAdmins,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-clientadmin', protect, authorize('superadmin'), createUserBySuperAdmin);
router.get('/create-clientadmin', protect, authorize('superadmin'), getClientAdmins);

export default router;
