import express from "express";
import { getAllJobs, updateJobStatus, createJob, getDriverJobs } from "../controllers/jobController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all-jobs", protect, authorize, getAllJobs);
router.post("/create-job", protect, authorize('clientadmin'), createJob);
router.put("/:jobId", protect, authorize('driver', 'clientadmin'), updateJobStatus);
router.get("/driver-jobs", protect, authorize('driver', 'clientadmin'), getDriverJobs);

export default router;
