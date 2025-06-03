import express from "express"
import upload from "../middleware/uploadMiddleware.js";
import {getDriverById , createDriver, getAllDrivers, deleteDriverById, updateDriverById } from "../controllers/driverController.js";

const router = express.Router();

router.post(
  "/create-driver",
  upload.fields([
    { name: "driverPicture", maxCount: 1 },
    { name: "privateHireCard", maxCount: 1 },
    { name: "dvlaCard", maxCount: 1 },
    { name: "carPicture", maxCount: 1 },
    { name: "privateHireCarPaper", maxCount: 1 },
    { name: "driverPrivateHirePaper", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
    { name: "motExpiry", maxCount: 1 },
    { name: "V5", maxCount: 1 },
  ]),  
  createDriver
);  

router.get("/get-all-drivers", getAllDrivers);
router.get("/getDriverById/:id", getDriverById);
router.delete("/delete-driver/:id", deleteDriverById);

router.put("/update-driver/:id", upload.fields([
  { name: "driverPicture", maxCount: 1 },
  { name: "privateHireCard", maxCount: 1 },
  { name: "dvlaCard", maxCount: 1 },
  { name: "carPicture", maxCount: 1 },
  { name: "privateHireCarPaper", maxCount: 1 },
  { name: "driverPrivateHirePaper", maxCount: 1 },
  { name: "insurance", maxCount: 1 },
  { name: "motExpiry", maxCount: 1 },
  { name: "V5", maxCount: 1 },
])
, updateDriverById);

export default router;