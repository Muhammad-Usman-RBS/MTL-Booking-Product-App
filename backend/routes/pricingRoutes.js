import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getGeneralPricing,
  updateGeneralPricing,
} from "../controllers/pricings/generalController.js";
import {
  createVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/pricings/vehicleController.js";

const router = express.Router();

// 🔐 GET General Pricing (accessible to all authenticated users)
router.get("/general", protect, getGeneralPricing);

// 🔐 POST or Update General Pricing (restricted to admins)
router.post("/general", protect, authorize("admin", "superadmin"), updateGeneralPricing);

// 🔐 Create New Vehicle (requires image upload)
router.post(
  "/vehicles",
  protect,
  authorize("superadmin", "clientadmin"),
  upload.single("image"),
  createVehicle
);

// 🔓 Get All Vehicles (any authenticated user)
router.get("/vehicles", protect, getAllVehicles);

// 🔐 Update Vehicle by ID (requires image upload)
router.put(
  "/vehicles/:id",
  protect,
  authorize("superadmin", "clientadmin"),
  upload.single("image"),
  updateVehicle
);

// 🔐 Delete Vehicle by ID
router.delete(
  "/vehicles/:id",
  protect,
  authorize("superadmin", "clientadmin"),
  deleteVehicle
);

export default router;
