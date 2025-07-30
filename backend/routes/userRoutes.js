import express from 'express';
import { createUserBySuperAdmin, getClientAdmins, updateUserBySuperAdmin, deleteUserBySuperAdmin, getAllUsers, getAllDrivers, getAllCustomers, createCustomerViaWidget } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create user (clientadmin, staffmember, driver, etc.)
router.post('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin', 'customer'), createUserBySuperAdmin);

// Get users based on role and company scope
router.get('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getClientAdmins);
router.get('/get-All-Users', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getAllUsers);

// Update user by ID (name, email, role, etc.)
router.put('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), updateUserBySuperAdmin);

// Delete user by ID
router.delete('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), deleteUserBySuperAdmin);

// GET All Users with Role = "driver"
router.get("/get-all-drivers", protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getAllDrivers);

// GET All Users with Role = "customer"
router.get("/get-all-customers", protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), getAllCustomers);

// PUBLIC route for customer creation via widget
router.post("/create-customer", createCustomerViaWidget);

export default router;
