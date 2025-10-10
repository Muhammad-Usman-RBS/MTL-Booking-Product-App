import express from "express";
import { createUserBySuperAdmin, getClientAdmins, updateUserBySuperAdmin, deleteUserBySuperAdmin, getAllUsers, getAllDrivers, getAllCustomers, createCustomerViaWidget, getAssociateAdmins, initiateUserVerification, verifyUserOtpAndCreate, resendUserOtp, updateBookingFilterPreferences, getBookingFilterPreferences, getAllStaffmembers, getAllAssociateAdmins, getAllDemos } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/users/initiate-verification", protect, authorize("superadmin", "clientadmin", "associateadmin"), initiateUserVerification);
router.post("/users/verify-otp", protect, authorize("superadmin", "clientadmin", "associateadmin"), verifyUserOtpAndCreate);
router.post("/users/resend-otp", protect, authorize("superadmin", "clientadmin", "associateadmin"), resendUserOtp);
router.post("/create-clientadmin", protect, authorize("superadmin", "clientadmin", "associateadmin", "customer"), createUserBySuperAdmin);
router.get("/create-clientadmin", protect, authorize("superadmin", "clientadmin", "associateadmin"), getClientAdmins);
router.get("/admins/associates", protect, authorize("superadmin", "clientadmin"), getAssociateAdmins);
router.get("/get-All-Users", protect, authorize("superadmin", "clientadmin", "associateadmin", "staffmember"), getAllUsers);
router.put("/create-clientadmin/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), updateUserBySuperAdmin);
router.delete("/create-clientadmin/:id", protect, authorize("superadmin", "clientadmin", "associateadmin"), deleteUserBySuperAdmin);
router.get("/get-all-drivers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllDrivers);
router.get("/get-all-staffmembers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllStaffmembers)
router.get("/get-all-associateadmins",  protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllAssociateAdmins)
  router.get("/get-all-demos", protect,  authorize("superadmin", "clientadmin", "associateadmin"),  getAllDemos);
router.get("/get-all-customers", protect, authorize("superadmin", "clientadmin", "associateadmin"), getAllCustomers);
router.post("/create-customer", createCustomerViaWidget);
router.get("/preferences", protect, getBookingFilterPreferences);
router.patch("/preferences", protect, updateBookingFilterPreferences);

export default router;
