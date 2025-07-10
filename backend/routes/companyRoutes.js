import express from "express";
import {
  createCompanyAccount,
  getAllCompanies,
  getCompanyById,
  updateCompanyAccount,
  deleteCompanyAccount,
  sendCompanyEmail,
} from "../controllers/companyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";

const router = express.Router();
const companyUploader = getUploader("company");
const companyPicture = companyUploader.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
]); // FIX
// COMPANIES CRUD
router.post(
  "/",
  protect,
  authorize("superadmin", "clientadmin"),
  companyPicture,
  createCompanyAccount
);
router.get(
  "/",
  protect,
  authorize("superadmin", "clientadmin"),
  getAllCompanies
);
router.put(
  "/:id",
  protect,
  authorize("superadmin", "clientadmin"),
  companyPicture,
  updateCompanyAccount
);
router.delete("/:id", protect, authorize("superadmin"), deleteCompanyAccount);

// Get single company by ID
router.get("/:id", protect, getCompanyById);
// Send email to company
router.post("/send-company-email", sendCompanyEmail);

export default router;
