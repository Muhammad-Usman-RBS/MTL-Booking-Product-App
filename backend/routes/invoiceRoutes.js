import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createInvoice, getAllInvoices, getInvoiceById, updateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/create-invoice", protect, createInvoice);
router.get("/get-all-invoices", protect, getAllInvoices);
router.get("/get-invoice/:id", protect, getInvoiceById);
router.put("/update-invoice/:id", protect, updateInvoice);


export default router;
