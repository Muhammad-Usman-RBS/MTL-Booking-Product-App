import express from 'express';
import {
  createUserBySuperAdmin,
  getClientAdmins,
  updateUserBySuperAdmin,
  deleteUserBySuperAdmin,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// router.post('/create-clientadmin', protect, authorize('superadmin'), createUserBySuperAdmin);
router.post('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager'), createUserBySuperAdmin);
router.get('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager'), getClientAdmins);
// 🆕 Add this line:
router.put('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager'), updateUserBySuperAdmin);
// 🆕 ADD THIS:
router.delete('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager'), deleteUserBySuperAdmin);

export default router;
