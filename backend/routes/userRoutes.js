import express from "express";
import { createUserBySuperAdmin, getClientAdmins, updateUserBySuperAdmin, deleteUserBySuperAdmin, getAllUsers, getAllDrivers, getAllCustomers, createCustomerViaWidget, getAssociateAdmins, initiateUserVerification, verifyUserOtpAndCreate, resendUserOtp, updateBookingFilterPreferences, getBookingFilterPreferences } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// OTP flow start (Pending user + email OTP) — roles: superadmin|clientadmin|associateadmin
router.post("/users/initiate-verification", protect, authorize("superadmin", "clientadmin", "associateadmin"), initiateUserVerification);

// OTP verify (Pending → Active) — roles: superadmin|clientadmin|associateadmin
router.post("/users/verify-otp", protect, authorize("superadmin", "clientadmin", "associateadmin"), verifyUserOtpAndCreate);

// OTP resend (60s throttle) — roles: superadmin|clientadmin|associateadmin
router.post("/users/resend-otp", protect, authorize("superadmin", "clientadmin", "associateadmin"), resendUserOtp);

// Direct create (trusted/internal) — roles: superadmin|clientadmin|associateadmin|customer
router.post("/create-clientadmin", protect, authorize("superadmin", "clientadmin", "associateadmin", "customer"), createUserBySuperAdmin);

// Fetch users list (scoped to caller role) — roles: superadmin|clientadmin|associateadmin
router.get("/create-clientadmin", protect, authorize("superadmin", "clientadmin", "associateadmin"), getClientAdmins);

// Get associate admins of a clientadmin — roles: superadmin|clientadmin
router.get("/admins/associates", protect, authorize("superadmin", "clientadmin"), getAssociateAdmins);

// Get all users (excl. superadmin, not Deleted) — roles: superadmin|clientadmin|associateadmin
router.get("/get-All-Users", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllUsers);

// Update a user by id — roles: superadmin|clientadmin|associateadmin
router.put("/create-clientadmin/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateUserBySuperAdmin);

// Delete a user by id — roles: superadmin|clientadmin|associateadmin
router.delete("/create-clientadmin/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteUserBySuperAdmin);

// Get all drivers (role=driver, not Deleted) — roles: superadmin|clientadmin|associateadmin
router.get("/get-all-drivers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllDrivers);

// Get all customers (role=customer, not Deleted) — roles: superadmin|clientadmin|associateadmin
router.get("/get-all-customers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllCustomers);

// Public widget: create a customer (consider captcha/rate-limit) — public
router.post("/create-customer", createCustomerViaWidget);

// Add Preferences
router.get("/preferences", protect, getBookingFilterPreferences);
router.patch("/preferences", protect, updateBookingFilterPreferences);

export default router;
