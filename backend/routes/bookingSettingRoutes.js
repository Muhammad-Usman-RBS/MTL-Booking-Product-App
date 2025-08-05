import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBookingSetting,
  createOrUpdateBookingSetting
} from "../controllers/settings/bookingSettingController.js";

const router = express.Router();

router.get("/get-booking-setting", protect, getBookingSetting);
router.post("/update-booking-setting", protect, createOrUpdateBookingSetting);

export default router;
