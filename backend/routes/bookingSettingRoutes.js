import express from "express";
import { protect, authorize  } from "../middleware/authMiddleware.js";
import { getBookingSetting, createOrUpdateBookingSetting } from "../controllers/settings/bookingSettingController.js";

const router = express.Router();

router.get("/get-booking-setting", protect, authorize("superadmin", "clientadmin"), getBookingSetting);
router.post("/update-booking-setting", protect, authorize("superadmin", "clientadmin"), createOrUpdateBookingSetting);

export default router;
