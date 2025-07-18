import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createInvoice, deleteInvoice, getAllInvoices, getInvoiceById, sendInvoiceEmail, updateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.post("/create-invoice", protect, createInvoice);
router.get("/get-all-invoices", protect, getAllInvoices);
router.get("/get-invoice/:id", protect, getInvoiceById);
router.put("/update-invoice/:id", protect, updateInvoice);
router.delete("/delete-invoice/:id", protect, deleteInvoice);
router.post("/send-invoice-email", protect, sendInvoiceEmail);


export default router;
