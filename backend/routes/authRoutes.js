import express from "express";
import {
  login,
  updateProfile,
  sendOtpToEmail,
  resetPasswordWithOtp,
  getSuperadminInfo,
  refreshToken,
  verifyOtp,
  resendLoginOtp,
  getMe,
  logout,
} from "../controllers/authController.js";

import { authorize, protect } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";

const router = express.Router();
const userUploader = getUploader("user");
const uploadfields = [
  { name: "profileImage", maxCount: 1 },
  { name: "superadminCompanyLogo", maxCount: 1 },
];

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendLoginOtp);
router.get("/superadmin-info", getSuperadminInfo);
router.put("/profile", protect, userUploader.fields(uploadfields), updateProfile);
router.post("/forgot-password", sendOtpToEmail);
router.post("/new-password", resetPasswordWithOtp);
router.post("/refresh", refreshToken);
router.get("/me", protect, authorize( "superadmin", "clientadmin", "staffmember", "customer", "driver", "associateadmin" ), getMe);
router.post("/logout", logout);

export default router;
