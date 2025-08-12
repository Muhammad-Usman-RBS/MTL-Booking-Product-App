import express from "express";
import {
  getAllJobs,
  updateJobStatus,
  createJob,
  getDriverJobs,
  DeleteJob,
} from "../controllers/jobController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all-jobs", protect, getAllJobs);
router.post("/create-job", protect, authorize("clientadmin"), createJob);
router.put(
  "/:jobId",
  protect,
  authorize("driver", "clientadmin"),
  updateJobStatus
);
router.get(
  "/driver-jobs",
  protect,
  authorize("driver", "clientadmin"),
  getDriverJobs
);
router.delete("delete-job/:jobId", DeleteJob )

export default router;
