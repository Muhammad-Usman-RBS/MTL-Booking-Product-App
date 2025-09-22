// routes/termsAndConditions.js
import express from "express";
const router = express.Router();
import {
  createTerms,
  deleteTerms,
  getTerms,
  updateTerms,
} from "../controllers/settings/termsandConditionsController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/create", protect, createTerms);
router.get("/get", protect, getTerms);
router.put("/update/:id", protect, updateTerms);
router.delete("/delete/:id", protect, deleteTerms);
export default router;
