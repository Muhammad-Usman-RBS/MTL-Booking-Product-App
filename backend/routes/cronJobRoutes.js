import express from "express";
import { createCronJob, getCronJob, getAllCronJobs, updateCronJob, updateCronJobByCompany, deleteCronJob, toggleCronJobFeature } from "../controllers/settings/cronJobController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Get cron job configuration for a specific company
router.get("/", protect, authorize("clientadmin", "superadmin"), getCronJob);

// GET: Get all cron jobs (super admin only)
router.get("/all", protect, authorize("superadmin"), getAllCronJobs);

// POST: Create new cron job configuration
router.post("/create", protect, authorize("clientadmin", "superadmin"), createCronJob);

// PUT: Update cron job by ID
router.put("/:cronJobId", protect, authorize("clientadmin", "superadmin"), updateCronJob);

// PUT: Update cron job by company ID (more convenient for frontend)
router.put("/company/:companyId", protect, authorize("clientadmin", "superadmin"), updateCronJobByCompany);

// PUT: Toggle specific feature (enable/disable)
router.put("/company/:companyId/toggle", protect, authorize("clientadmin", "superadmin"), toggleCronJobFeature);

// DELETE: Delete cron job configuration
router.delete("/:cronJobId", protect, authorize("clientadmin", "superadmin"), deleteCronJob);

export default router;