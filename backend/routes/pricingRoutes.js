import express from "express";
import { getGeneralPricing, updateGeneralPricing } from "../controllers/pricings/generalController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// PRICING => GENERAL
router.get("/general", protect, getGeneralPricing);
router.post("/general", protect, authorize("admin", "superadmin"), updateGeneralPricing);

export default router;
