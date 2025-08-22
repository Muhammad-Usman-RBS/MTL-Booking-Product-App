// controllers/stripeController.js
import crypto from "crypto";
import stripe from "../../config/stripe.js";

/** Build an idempotency key that's stable for the same request */
const makeIdemKey = (payload) =>
  crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

/** Small helpers */
const clampQty = (q) => {
  const n = Number.isFinite(+q) ? Math.floor(+q) : 1;
  return Math.min(Math.max(n, 1), 99);
};
const ensureFrontUrl = () => {
  const url = (process.env.BASE_URL_FRONTEND || process.env.FRONTEND_URL || "").trim();
  if (!url) throw new Error("Frontend URL not configured (BASE_URL_FRONTEND / FRONTEND_URL).");
  return url.replace(/\/$/, ""); // remove trailing slash
};

/**
 * POST /api/stripe/create-checkout-session
 * Body: { items: [{ name?, priceId? , amount, quantity, currency }], bookingId, customerEmail, mode? }
 * - Prefer items[].priceId (Price IDs from Stripe)
 * - If amount used, it MUST be computed/validated on server (in smallest unit)
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items = [], bookingId = "", customerEmail = "", mode = "payment" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one line item is required." });
    }

    // TODO: (Recommended) Validate each item against your DB to prevent tampering.
    // e.g., lookup productId -> priceId/amount/currency server-side.

    const line_items = items.map((it) => {
      // Use Stripe Price if provided
      if (it.priceId) {
        return { price: String(it.priceId), quantity: clampQty(it.quantity) };
      }

      // Fallback: explicit price data (amount in smallest currency unit, e.g., pence)
      const unit_amount = Number(it.amount);
      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error("Invalid amount for line item.");
      }

      return {
        price_data: {
          currency: (it.currency || "gbp").toLowerCase(),
          product_data: { name: String(it.name || "Item") },
          unit_amount: Math.floor(unit_amount),
        },
        quantity: clampQty(it.quantity),
      };
    });

    const FRONT_URL = ensureFrontUrl();

    const payloadForIdem = {
      bookingId,
      customerEmail,
      mode,
      line_items: line_items.map((li) => ({
        price: li.price,
        qty: li.quantity,
        unit_amount: li.price_data?.unit_amount,
        currency: li.price_data?.currency,
      })),
    };

    const session = await stripe.checkout.sessions.create(
      {
        mode, // "payment" | "subscription"
        line_items,
        // Let Checkout create a Customer if needed; captures email on receipt
        customer_email: customerEmail || undefined,
        customer_creation: "if_required",
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        phone_number_collection: { enabled: true },

        // Keep bookingId in both places so you can read it from PI or Session
        metadata: { bookingId: String(bookingId || "") },
        payment_intent_data: {
          metadata: { bookingId: String(bookingId || "") },
        },

        success_url: `${FRONT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_URL}/payment/cancel`,
      },
      { idempotencyKey: makeIdemKey(payloadForIdem) }
    );

    // Return only what the client needs
    res.json({ id: session.id });
  } catch (err) {
    // Map Stripe-specific errors to readable messages
    const msg =
      (err?.raw && err.raw.message) ||
      err?.message ||
      "Failed to create checkout session.";
    // Optionally detect misconfig:
    if (/No such price/i.test(msg) || /Invalid API Key/i.test(msg)) {
      return res.status(500).json({ message: `Stripe misconfigured: ${msg}` });
    }
    next(err);
  }
};
