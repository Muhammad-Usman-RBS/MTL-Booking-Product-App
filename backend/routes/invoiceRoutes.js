import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/create-invoice", protect, createInvoice);

export default router;
