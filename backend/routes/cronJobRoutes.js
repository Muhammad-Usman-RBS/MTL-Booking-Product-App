import express from "express";
import { createCronJob, getCronJob, getAllCronJobs, updateCronJob, updateCronJobByCompany, deleteCronJob, toggleCronJobFeature, runNow,  startDriverStatementsSchedule, autoAllocateDrivers } from "../controllers/settings/cronJobController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, authorize("clientadmin"), createCronJob);
router.get("/", protect, getCronJob);
router.get("/all", protect, getAllCronJobs);
router.put("/:cronJobId", protect, authorize("clientadmin"), updateCronJob);
router.put("/company/:companyId", protect, authorize("clientadmin"), updateCronJobByCompany);
router.put("/company/:companyId/toggle", protect, authorize("clientadmin"), toggleCronJobFeature);
router.delete("/:cronJobId", protect, authorize("clientadmin"), deleteCronJob);
router.post("/driver-docs/run-now", protect, authorize("clientadmin"), runNow);
router.get("/send-invoice-email",  startDriverStatementsSchedule);
router.get("/test",  autoAllocateDrivers);

export default router;
