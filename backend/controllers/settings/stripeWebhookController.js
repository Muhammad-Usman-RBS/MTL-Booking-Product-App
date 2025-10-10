import stripe from "../../config/stripe.js";

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
    return res.status(400).send("Missing Stripe-Signature header");
  }
  if (!secret) {
    return res.status(500).send("Webhook secret not configured");
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody ?? req.body,
      sig,
      secret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (alreadyProcessed(event.id)) {
    return res.json({ received: true, deduped: true });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId || "";
        const paymentIntentId = session.payment_intent || "";
        const amountTotal = session.amount_total ?? null;
        const currency = session.currency || "";
        const customerEmail =
          session.customer_details?.email || session.customer_email || "";
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const paymentIntentId = pi.id;
        const amount = pi.amount_received ?? pi.amount;
        const currency = pi.currency;
        const bookingId = pi.metadata?.bookingId || "";
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const bookingId = pi.metadata?.bookingId || "";
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        break;
      }
      default:
    }
    return res.json({ received: true });
  } catch (e) {
    return res.status(200).json({ received: true, handledWithErrors: true });
  }
};