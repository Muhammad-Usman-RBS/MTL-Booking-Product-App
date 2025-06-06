import express from "express";
import { getAllZones, createZone, updateZone, deleteZone} from "../controllers/settings/zoneController.js";
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

// ZONES CRUD
router.get("/zones", protect, getAllZones);
router.post("/zones", protect, createZone);
router.put("/zones/:id", protect, updateZone);
router.delete("/zones/:id", protect, deleteZone);

export default router;
