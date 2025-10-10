import express from "express";
import bodyParser from "body-parser";
import { createCheckoutSession } from "../controllers/settings/stripeController.js";
import { handleStripeWebhook } from "../controllers/settings/stripeWebhookController.js";

const router = express.Router();

router.post("/create-checkout-session", express.json(), createCheckoutSession);
router.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, _res, next) => { req.rawBody = req.body; next() },handleStripeWebhook);
export default router;
