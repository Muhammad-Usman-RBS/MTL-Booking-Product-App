import express from 'express';
import {
  createCompanyAccount,
  getAllCompanies,
  getCompanyById,
  updateCompanyAccount,
  deleteCompanyAccount,
  sendCompanyEmail
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // Handles Cloudinary upload

const router = express.Router();

// @route   POST /api/companies
// @desc    Create new company (with image upload)
// @access  Protected (superadmin, clientadmin)
router.post(
  '/',
  protect,
  authorize('superadmin', 'clientadmin'),
  upload.single('profileImage'), // Cloudinary middleware
  createCompanyAccount
);

// @route   GET /api/companies
// @desc    Get all companies
// @access  Protected (superadmin)
router.get(
  '/',
  protect,
  authorize('superadmin', 'clientadmin'),
  getAllCompanies
);

// @route   GET /api/companies/:id
// @desc    Get single company by ID
// @access  Protected
router.get(
  '/:id',
  protect,
  getCompanyById
);

// @route   PUT /api/companies/:id
// @desc    Update company by ID
// @access  Protected (superadmin, clientadmin)
router.put(
  '/:id',
  protect,
  authorize('superadmin', 'clientadmin'),
  upload.single('profileImage'), // Optional file upload
  updateCompanyAccount
);

// @route   DELETE /api/companies/:id
// @desc    Delete company by ID
// @access  Protected (superadmin)
router.delete(
  '/:id',
  protect,
  authorize('superadmin'),
  deleteCompanyAccount
);

router.post("/send-company-email", sendCompanyEmail);

export default router;
