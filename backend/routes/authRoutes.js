import express from 'express';
import { login, updateProfile, sendOtpToEmail, resetPasswordWithOtp, getSuperadminInfo, refreshToken } from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';
import { getUploader } from '../middleware/cloudinaryUpload.js';

const router = express.Router();
const userUploader = getUploader('user');

// AUTH ROUTES
router.post('/login', login);
router.get('/superadmin-info', getSuperadminInfo);
router.put('/profile', protect, userUploader.fields([{name: 'profileImage', maxCount: 1}, {name: 'superadminCompanyLogo', maxCount: 1}]), updateProfile);router.post('/forgot-password', sendOtpToEmail);
router.post('/new-password', resetPasswordWithOtp);

// Refresh Token Route
router.post("/refresh", refreshToken);

// Get Current User
router.get("/me", protect, (req, res) => {
    res.json(req.user);
});

// Logout
router.post("/logout", (req, res) => {
   res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.json({ message: "Logged out successfully" });
});

export default router;
