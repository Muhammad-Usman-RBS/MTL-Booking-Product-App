import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getGeneralPricing, updateGeneralPricing,
} from "../controllers/pricings/generalController.js";
import {
  createVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehiclesByCompanyId,
} from "../controllers/pricings/vehicleController.js";

const router = express.Router();

// 🔐 General Pricing
router.get("/general", protect, getGeneralPricing);
router.post("/general", protect, authorize("admin", "superadmin"), updateGeneralPricing);

// 🔐 Vehicle CRUD
router.post("/vehicles", protect, authorize("superadmin", "clientadmin"), upload.single("image"), createVehicle);
router.get("/vehicles", protect, getAllVehicles);
router.put("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), upload.single("image"), updateVehicle);
router.delete("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), deleteVehicle);

// ✅ Public access for iframe/widget
router.get("/vehicles/public", getVehiclesByCompanyId);

export default router;
