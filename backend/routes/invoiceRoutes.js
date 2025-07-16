import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createInvoice, getAllInvoices, updateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/create-invoice", protect, createInvoice);
router.get("/get-all-invoices", protect, getAllInvoices);
router.put("/update-invoice/:id", protect, updateInvoice);


export default router;
