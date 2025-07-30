import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
    createCustomer,
    getCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

// Protect routes and allow only certain roles to access
router.post("/create-customer", protect, authorize("clientadmin", "manager"), createCustomer);
router.get("/customers", protect, authorize("clientadmin", "manager"), getCustomers);
router.get("/customer/:id", protect, authorize("clientadmin", "manager"), getCustomer);
router.put("/customer/:id", protect, authorize("clientadmin", "manager"), updateCustomer);
router.delete("/customer/:id", protect, authorize("clientadmin", "manager"), deleteCustomer);

export default router;
