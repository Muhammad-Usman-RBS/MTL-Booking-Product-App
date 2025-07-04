import express from 'express';
import { createUserBySuperAdmin, getClientAdmins, updateUserBySuperAdmin, deleteUserBySuperAdmin, getAllUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create user (clientadmin, staffmember, driver, etc.)
router.post('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), createUserBySuperAdmin);

// Get users based on role and company scope
router.get('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getClientAdmins);
router.get('/get-All-Users', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getAllUsers);

// Update user by ID (name, email, role, etc.)
router.put('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), updateUserBySuperAdmin);

// Delete user by ID
router.delete('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), deleteUserBySuperAdmin);

export default router;
