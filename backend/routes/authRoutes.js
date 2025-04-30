import express from 'express';
import {
  login,
  updateProfile,
  sendOtpToEmail,
  resetPasswordWithOtp,
} from '../controllers/authController.js'; // ✅ Authentication & user-related controller functions

import { protect } from '../middleware/authMiddleware.js'; // ✅ JWT-based auth middleware
import upload from '../middleware/uploadMiddleware.js';     // ✅ Multer middleware for profile image uploads

const router = express.Router();

/* ------------------- AUTH ROUTES ------------------- */

// ✅ Login - Public Route
// Description: Authenticates user with email & password, returns JWT
router.post('/login', login);

// ✅ Update Profile - Protected Route
// Description: Allows authenticated user to update profile info including password and image
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// ✅ Forgot Password - Send OTP to Email
// Description: Sends a one-time password (OTP) to the registered email
router.post('/forgot-password', sendOtpToEmail);

// ✅ Reset Password with OTP
// Description: Verifies OTP and allows password reset
router.post('/new-password', resetPasswordWithOtp);

export default router;
