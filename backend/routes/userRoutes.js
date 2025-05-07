import express from 'express';
import {
  createUserBySuperAdmin,
  getClientAdmins,
  updateUserBySuperAdmin,
  deleteUserBySuperAdmin,
} from '../controllers/userController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ------------------ USER MANAGEMENT ROUTES ------------------ */

// ✅ Create a New User
// Access: Superadmin, ClientAdmin, Manager (with role-based limitations)
// Description: Used to create users like clientadmin, staffmember, driver, etc.
router.post('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), createUserBySuperAdmin);

// ✅ Get All Users under a Role Scope
// Access: Superadmin (global), ClientAdmin & Manager (company-specific)
// Description: Returns filtered user list based on requester's role and company
router.get('/create-clientadmin', protect, authorize('superadmin', 'clientadmin', 'manager'), getClientAdmins);

// ✅ Update an Existing User by ID
// Access: Superadmin, ClientAdmin, Manager
// Description: Updates selected user’s info like name, email, password, role, etc.
router.put('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager', 'associateadmin'), updateUserBySuperAdmin);

// ✅ Delete a User by ID
// Access: Superadmin, ClientAdmin, Manager
// Description: Deletes the user document from database based on _id
router.delete('/create-clientadmin/:id', protect, authorize('superadmin', 'clientadmin', 'manager'), deleteUserBySuperAdmin);

export default router;
