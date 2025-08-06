import express from "express";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { getDriverById, createDriver, getAllDrivers, deleteDriverById, updateDriverById } from "../controllers/driverController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const driverUploader = getUploader('driver'); // 📂 MTL-BOOKING-APP/driver

// Fields allowed for upload (max 1 per field)
const driverUploadFields = driverUploader.fields([
  { name: "driverPicture", maxCount: 1 },
  { name: "privateHireCard", maxCount: 1 },
  { name: "dvlaCard", maxCount: 1 },
  { name: "carPicture", maxCount: 1 },
  { name: "privateHireCarPaper", maxCount: 1 },
  { name: "driverPrivateHirePaper", maxCount: 1 },
  { name: "insurance", maxCount: 1 },
  { name: "motExpiry", maxCount: 1 },
  { name: "V5", maxCount: 1 },
]);

/* ---------------- DRIVER ROUTES ---------------- */

// Create Driver (with multiple documents)
router.post("/create-driver", driverUploadFields, createDriver);

// Get All Drivers
router.get("/get-all-drivers",protect ,getAllDrivers);

// Get Single Driver
router.get("/getDriverById/:id", getDriverById);

// Delete Driver
router.delete("/delete-driver/:id", deleteDriverById);

// Update Driver (with multiple optional document updates)
router.put("/update-driver/:id", driverUploadFields, updateDriverById);

export default router;
