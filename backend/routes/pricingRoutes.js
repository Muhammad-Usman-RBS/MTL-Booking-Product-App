import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { getGeneralPricing, updateGeneralPricing } from "../controllers/pricings/generalController.js";
import { createVehicle, getAllVehicles, updateVehicle, deleteVehicle, getVehiclesByCompanyId } from "../controllers/pricings/vehicleController.js";
import { createHourlyPackage, deleteHourlyPackage, getAllHourlyPackages, getHourlyPackageById, updateHourlyPackage } from "../controllers/pricings/hourlyPackageController.js";
import { getAllFixedPrices, createFixedPrice, updateFixedPrice, deleteFixedPrice } from "../controllers/pricings/fixedPriceController.js";
import { getAllExtras, createExtra, updateExtra, deleteExtra } from "../controllers/pricings/extrasController.js";

const router = express.Router();
const vehicleUploader = getUploader("vehicle");

// VEHICLE PRICING
router.post("/vehicles", protect, authorize("superadmin", "clientadmin"), vehicleUploader.single("image"), createVehicle);
router.get("/vehicles", protect, getAllVehicles);
router.put("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), vehicleUploader.single("image"), updateVehicle);
router.delete("/vehicles/:id", protect, authorize("superadmin", "clientadmin"), deleteVehicle);
router.get("/vehicles/public", getVehiclesByCompanyId);

// GENERAL
router.get("/general", protect, getGeneralPricing);
router.post("/general", protect, authorize("superadmin", "clientadmin"), updateGeneralPricing);

// HOURLY PACKAGES
router.post("/addHourlyPackage", createHourlyPackage);
router.get("/getAllHourlyRates", getAllHourlyPackages);
router.get("/getHourlyRateById/:id", getHourlyPackageById);
router.put("/updateHourlyPackage/:id", updateHourlyPackage);
router.delete("/delHourlyPackage/:id", deleteHourlyPackage);

// FIXED PRICING
router.get("/fixed-prices", protect, getAllFixedPrices);
router.post("/fixed-prices", protect, createFixedPrice);
router.put("/fixed-prices/:id", protect, updateFixedPrice);
router.delete("/fixed-prices/:id", protect, deleteFixedPrice);

// EXTRAS PRICING
router.get("/extras", protect, getAllExtras);
router.post("/extras", protect, createExtra);
router.put("/extras/:id", protect, updateExtra);
router.delete("/extras/:id", protect, deleteExtra);

export default router;
