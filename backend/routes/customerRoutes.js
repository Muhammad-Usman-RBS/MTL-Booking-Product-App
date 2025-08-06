import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();

const customerUploader = getUploader("customer");

const customerUploadFields = customerUploader.fields([
  { name: "profile", maxCount: 1 },
]);

// Protect routes and allow only certain roles to access
router.post("/create-customer", protect, authorize("clientadmin", "manager"), customerUploadFields, createCustomer);
router.get("/customers", protect, authorize("clientadmin", "manager"), getCustomers);
router.get("/customer/:id", protect, authorize("clientadmin", "manager"), getCustomer);
router.put("/customer/:id", protect, authorize("clientadmin", "manager"), customerUploadFields, updateCustomer);
router.delete("/customer/:id", protect, authorize("clientadmin", "manager"), deleteCustomer);

export default router;