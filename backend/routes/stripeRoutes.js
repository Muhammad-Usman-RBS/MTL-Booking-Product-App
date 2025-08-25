import express from "express";
import bodyParser from "body-parser";
import { createCheckoutSession } from "../controllers/settings/stripeController.js";
import { handleStripeWebhook } from "../controllers/settings/stripeWebhookController.js";

const router = express.Router();

// JSON parser for normal endpoints
router.post("/create-checkout-session", express.json(), createCheckoutSession);

// RAW parser ONLY for the webhook to preserve body for signature verification
router.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    // middleware to expose raw body to controller
    (req, _res, next) => {
        req.rawBody = req.body; // Buffer
        next();
    },
    handleStripeWebhook
);

export default router;
