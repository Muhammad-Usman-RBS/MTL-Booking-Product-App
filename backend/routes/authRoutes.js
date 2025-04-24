import express from 'express'; 
import { login, updateProfile } from '../controllers/authController.js'; // Controller functions for login and profile update
import { protect } from '../middleware/authMiddleware.js';               // Middleware to protect routes (auth check)
import upload from '../middleware/uploadMiddleware.js';                  // Middleware for handling image uploads (e.g., profileImage)

const router = express.Router();

// Public Route: Login
// Description: Authenticates user and returns JWT token
router.post('/login', login);

// Protected Route: Update User Profile
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

export default router;
