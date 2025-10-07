import express from 'express';
import { login, updateProfile, sendOtpToEmail, resetPasswordWithOtp, getSuperadminInfo, refreshToken } from '../controllers/authController.js';

import { authorize, protect } from '../middleware/authMiddleware.js';
import { getUploader } from '../middleware/cloudinaryUpload.js';

const router = express.Router();
const userUploader = getUploader('user');

// AUTH ROUTES
router.post('/login', login);
router.get('/superadmin-info', getSuperadminInfo);
router.put('/profile', protect, userUploader.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'superadminCompanyLogo', maxCount: 1 }]), updateProfile); router.post('/forgot-password', sendOtpToEmail);
router.post('/new-password', resetPasswordWithOtp);

// Refresh Token Route
router.post("/refresh", refreshToken);

// Get Current User
router.get("/me", protect, authorize("superadmin", "clientadmin", "customer", "driver"), (req, res) => {
  const u = req.user;
  if (!u) {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.json({
    _id: u._id || null,
    email: u.email || "",
    fullName: u.fullName || "",
    role: u.role || "",
    companyId: u.companyId || null,
    permissions: u.permissions || [],
    profileImage: u.profileImage || "",
    employeeNumber: u.employeeNumber || null,
    superadminCompanyName: u.superadminCompanyName || "",
    superadminCompanyAddress: u.superadminCompanyAddress || "",
    superadminCompanyPhoneNumber: u.superadminCompanyPhoneNumber || "",
    superadminCompanyEmail: u.superadminCompanyEmail || "",
    superadminCompanyLogo: u.superadminCompanyLogo || "",
  });
});

// Logout
router.post("/logout", (req, res) => {
  // res.clearCookie("access_token", {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  // });
  // res.clearCookie("refresh_token", {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  // });
  // CORRECT:
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
