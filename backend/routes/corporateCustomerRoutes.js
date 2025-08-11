import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { createCorporateCustomer, getCorporateCustomers, getCorporateCustomer, updateCorporateCustomer, deleteCorporateCustomer, getCorporateCustomerByVat } from "../controllers/corporateCustomerController.js";

const router = express.Router();

const uploader = getUploader("corporate-customer");
const uploadFields = uploader.fields([{ name: "profile", maxCount: 1 }]);

router.post("/create-corporate-customer", protect, authorize("clientadmin", "manager", "customer"), uploadFields, createCorporateCustomer);
router.get("/corporate-customers", protect, authorize("clientadmin", "manager", "customer"), getCorporateCustomers);
router.get("/corporate-customer/:id", protect, authorize("clientadmin", "manager", "customer"), getCorporateCustomer);
router.get("/by-vat/:vatnumber", protect, authorize("clientadmin", "manager", "customer"), getCorporateCustomerByVat);
router.put("/corporate-customer/:id", protect, authorize("clientadmin", "manager", "customer"), uploadFields, updateCorporateCustomer);
router.delete("/corporate-customer/:id", protect, authorize("clientadmin", "manager", "customer"), deleteCorporateCustomer);

export default router