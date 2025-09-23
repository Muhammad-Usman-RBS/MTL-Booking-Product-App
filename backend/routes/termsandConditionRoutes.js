import express from "express";
const router = express.Router();

import { protect, authorize } from "../middleware/authMiddleware.js";
import { createTerms, deleteTerms, getTerms, updateTerms } from "../controllers/settings/termsandConditionsController.js";

router.post("/create", protect, authorize("superadmin", "clientadmin", "asscoiateadmin", "staffmember"), createTerms);
router.get("/get", protect, authorize("superadmin", "clientadmin", "asscoiateadmin", "staffmember", "customer", "driver"), getTerms);
router.put("/update/:id", protect, authorize("superadmin", "clientadmin", "asscoiateadmin", "staffmember"), updateTerms);
router.delete("/delete/:id", protect, authorize("superadmin", "clientadmin", "asscoiateadmin", "staffmember"), deleteTerms);

export default router;
