import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";

// Updated controller import
import { createCorporateCustomer, getCorporateCustomers, getCorporateCustomer, updateCorporateCustomer, deleteCorporateCustomer } from "../controllers/corporateCustomerController.js";

const router = express.Router();

// Cloudinary folder now "corporate-customer"
const uploader = getUploader("corporate-customer");

const uploadFields = uploader.fields([
  { name: "profile", maxCount: 1 },
]);

// Secure routes
router.post(
  "/create-corporate-customer",
  protect,
  authorize("clientadmin", "manager"),
  uploadFields,
  createCorporateCustomer
);

router.get(
  "/corporate-customers",
  protect,
  authorize("clientadmin", "manager"),
  getCorporateCustomers
);

router.get(
  "/corporate-customer/:id",
  protect,
  authorize("clientadmin", "manager"),
  getCorporateCustomer
);

router.put(
  "/corporate-customer/:id",
  protect,
  authorize("clientadmin", "manager"),
  uploadFields,
  updateCorporateCustomer
);

router.delete(
  "/corporate-customer/:id",
  protect,
  authorize("clientadmin", "manager"),
  deleteCorporateCustomer
);

export default router;
