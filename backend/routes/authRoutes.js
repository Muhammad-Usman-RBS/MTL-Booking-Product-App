import express from 'express';
import { login, updateProfile, sendOtpToEmail, resetPasswordWithOtp, getSuperadminInfo } from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';
import { getUploader } from '../middleware/cloudinaryUpload.js';

const router = express.Router();
const userUploader = getUploader('user'); 

// AUTH ROUTES
router.post('/login', login);
router.get('/superadmin-info', getSuperadminInfo);
router.put('/profile', protect, userUploader.single('profileImage'), updateProfile);
router.post('/forgot-password', sendOtpToEmail);
router.post('/new-password', resetPasswordWithOtp);

export default router;
