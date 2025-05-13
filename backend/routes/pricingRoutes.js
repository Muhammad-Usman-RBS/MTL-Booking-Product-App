import express from "express";
import { getGeneralPricing, updateGeneralPricing } from "../controllers/pricings/generalController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} from "../controllers/pricings/vehicleController.js";

const router = express.Router();

// PRICING => GENERAL
router.get("/general", protect, getGeneralPricing);
router.post("/general", protect, authorize("admin", "superadmin"), updateGeneralPricing);

// PRICING => VEHICLE
router.post("/vehicles", protect, authorize("superadmin", "admin"), upload.single("image"), createVehicle);
router.get("/vehicles", protect, getAllVehicles);
router.put("/vehicles/:id", protect, authorize("superadmin", "admin"), upload.single("image"), updateVehicle);
router.delete("/vehicles/:id", protect, authorize("superadmin", "admin"), deleteVehicle);

export default router;
