// controllers/stripeWebhookController.js
import stripe from "../../config/stripe.js";

/**
 * NOTE:
 * - Webhook route must be mounted with bodyParser.raw({ type: "application/json" })
 *   BEFORE express.json(). (Already handled in server.js as we discussed.)
 * - Set STRIPE_WEBHOOK_SECRET in your server env (Render).
 */

// OPTIONAL: naive in-memory dedupe (replace with DB-backed unique index in prod)
const seenEventIds = new Set();
const alreadyProcessed = (id) => {
  if (seenEventIds.has(id)) return true;
  seenEventIds.add(id);
  return false;
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error("[STRIPE] Missing Stripe-Signature header");
    return res.status(400).send("Missing Stripe-Signature header");
  }
  if (!secret) {
    console.error("[STRIPE] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    // Verify using raw body + webhook secret
    event = stripe.webhooks.constructEvent(
      req.rawBody ?? req.body, // Buffer set by route-level raw parser
      sig,
      secret
    );
  } catch (err) {
    console.error("[STRIPE] Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Dedupe same event id (Stripe can retry)
  if (alreadyProcessed(event.id)) {
    // Quick 200 so Stripe stops retrying
    return res.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Useful fields
        const bookingId = session.metadata?.bookingId || "";
        const paymentIntentId = session.payment_intent || "";
        const amountTotal = session.amount_total ?? null; // in smallest unit
        const currency = session.currency || "";
        const customerEmail =
          session.customer_details?.email || session.customer_email || "";

        // TODO:
        // 1) Idempotent DB update (upsert by paymentIntentId or bookingId)
        // 2) Mark booking/order as paid
        // 3) Store payment record with amount/currency/email
        // Example (pseudo):
        // await Payments.updateOne(
        //   { paymentIntentId },
        //   { $setOnInsert: { status: "succeeded", amount: amountTotal, currency, bookingId, email: customerEmail } },
        //   { upsert: true }
        // );
        // await Bookings.updateOne({ _id: bookingId }, { $set: { paid: true, paidAt: new Date(), paymentIntentId } });

        console.log("[STRIPE] checkout.session.completed", {
          eventId: event.id,
          bookingId,
          paymentIntentId,
          amountTotal,
          currency,
          customerEmail,
        });
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object;

        const paymentIntentId = pi.id;
        const amount = pi.amount_received ?? pi.amount; // smallest unit
        const currency = pi.currency;
        const bookingId = pi.metadata?.bookingId || "";

        // TODO: optional reinforcement of paid state (idempotent)
        // await Payments.updateOne({ paymentIntentId }, { $set: { status: "succeeded", amount, currency, bookingId } }, { upsert: true });

        console.log("[STRIPE] payment_intent.succeeded", {
          eventId: event.id,
          bookingId,
          paymentIntentId,
          amount,
          currency,
        });
        break;
      }

      // Optional but useful events
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId || "";
        console.warn("[STRIPE] payment_intent.payment_failed", {
          eventId: event.id,
          bookingId,
          paymentIntentId: pi.id,
          reason: pi.last_payment_error?.message,
        });
        // TODO: mark as failed / notify user if needed
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        // TODO: mark refund in your system if you support refunds
        console.log("[STRIPE] charge.refunded", {
          eventId: event.id,
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          currency: charge.currency,
        });
        break;
      }

      default:
        // Keep logs minimal but informative
        console.log(`[STRIPE] Unhandled event: ${event.type} (${event.id})`);
    }

    // Respond fast; heavy work should be queued (BullMQ, etc.)
    return res.json({ received: true });
  } catch (e) {
    // If your downstream fails, returning 200 avoids infinite retries.
    // If you want Stripe to retry, you can return 500 – but ensure idempotency first.
    console.error("[STRIPE] Webhook handler error:", e);
    return res.status(200).json({ received: true, handledWithErrors: true });
  }
};
