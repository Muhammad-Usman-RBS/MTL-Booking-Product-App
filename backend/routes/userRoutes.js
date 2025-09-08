import express from 'express';
import {
  createUserBySuperAdmin,
  getClientAdmins,
  updateUserBySuperAdmin,
  deleteUserBySuperAdmin,
  getAllUsers,
  getAllDrivers,
  getAllCustomers,
  createCustomerViaWidget,
  getAssociateAdmins,   // ⬅️ NEW controller
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create user (clientadmin, staffmember, driver, etc.)
router.post(
  '/create-clientadmin',
  protect,
  authorize('superadmin', 'clientadmin',  'associateadmin', 'customer'),
  createUserBySuperAdmin
);

// Get client admins
router.get(
  '/create-clientadmin',
  protect,
  authorize('superadmin', 'clientadmin',  'associateadmin'),
  getClientAdmins
);

// 🔥 NEW: Get associate admins for a clientadmin
router.get(
  '/admins/associates',
  protect,
  authorize('superadmin', 'clientadmin'),   // only superadmin & clientadmin allowed
  getAssociateAdmins
);

router.get(
  '/get-All-Users',
  protect,
  authorize('superadmin', 'clientadmin', 'associateadmin'),
  getAllUsers
);

// Update user by ID (name, email, role, etc.)
router.put(
  '/create-clientadmin/:id',
  protect,
  authorize('superadmin', 'clientadmin', 'associateadmin'),
  updateUserBySuperAdmin
);

// Delete user by ID
router.delete(
  '/create-clientadmin/:id',
  protect,
  authorize('superadmin', 'clientadmin', 'associateadmin'),
  deleteUserBySuperAdmin
);

// GET All Users with Role = "driver"
router.get(
  '/get-all-drivers',
  protect,
  authorize('superadmin', 'clientadmin', 'associateadmin'),
  getAllDrivers
);

// GET All Users with Role = "customer"
router.get(
  '/get-all-customers',
  protect,
  authorize('superadmin', 'clientadmin', 'associateadmin'),
  getAllCustomers
);

// PUBLIC route for customer creation via widget
router.post('/create-customer', createCustomerViaWidget);

export default router;
