// controllers/stripeController.js
import stripe from "../../config/stripe.js";

// Utility for generating a unique idempotency key (for retries)
const generateIdempotencyKey = (payload) => {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items = [], bookingId, customerEmail, mode = "payment" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one line item is required." });
    }

    // Building line items dynamically based on the payload
    const line_items = items.map((it) => {
      if (it.priceId) {
        return { price: it.priceId, quantity: it.quantity || 1 };
      }
      // Fallback to amount if priceId is not available
      return {
        price_data: {
          currency: it.currency || "gbp",
          product_data: { name: it.name },
          unit_amount: it.amount, // in smallest unit (e.g., pence)
        },
        quantity: it.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode, // "payment" | "subscription"
        line_items,
        customer_email: customerEmail || undefined,
        customer_creation: "if_required",
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        success_url: `${process.env.BASE_URL_FRONTEND}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL_FRONTEND}/payment/cancel`,
      },
      { idempotencyKey: generateIdempotencyKey(req.body) }
    );

    res.json({ id: session.id });
  } catch (err) {
    next(err);
  }
};
