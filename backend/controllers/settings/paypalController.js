// Environment Variables Based PayPal Controller
import { getPayPalClient, paypal } from "../../utils/settings/paypalClient.js";

/** ──────────────────────────────────────────────────────────────
 * Single source of truth: currency backend decide karega
 * ────────────────────────────────────────────────────────────── */
const MERCHANT_CCY = (process.env.PAYPAL_CURRENCY).toUpperCase();

// Zero-decimal currencies (PayPal requires integer string)
const ZERO_DEC = new Set(["JPY", "TWD", "HUF"]);
const fmtAmount = (val, ccy) =>
  ZERO_DEC.has((ccy || "").toUpperCase())
    ? String(Math.round(Number(val || 0)))
    : Number(val || 0).toFixed(2);

/** GET /paypal/config
 * Frontend ko clientId + currency + mode deta hai
 */
export const getConfig = (req, res) => {
  try {
    const cfg = {
      clientId: process.env.PAYPAL_CLIENT_ID,
      currency: MERCHANT_CCY,
      mode: process.env.PAYPAL_MODE || "sandbox",
    };

    if (!cfg.clientId) {
      return res
        .status(500)
        .json({ message: "PayPal client ID not found in environment variables" });
    }

    res.json(cfg);
  } catch (error) {
    console.error("[PayPal] Config error:", error);
    res.status(500).json({ message: "Failed to get PayPal config" });
  }
};

/** POST /paypal/create-order
 * Body: { bookingId, amount, currency? }
 * Note: currency body me bhej dein to validate hoga; backend hi decide karega.
 */
export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount, currency } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Optional safety: client se bheji gayi currency mismatch ho to block
    if (currency && currency.toUpperCase() !== MERCHANT_CCY) {
      return res
        .status(400)
        .json({ message: `Currency mismatch. Expected ${MERCHANT_CCY}` });
    }

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(bookingId),
          amount: {
            currency_code: MERCHANT_CCY,                // <- only backend currency
            value: fmtAmount(n, MERCHANT_CCY),
          },
          description: `Booking payment for booking ID: ${bookingId}`,
        },
      ],
      application_context: {
        brand_name: process.env.PAYPAL_BRAND_NAME || "Your Business Name",
        user_action: "PAY_NOW",
      },
    });

    const response = await client.execute(request);
    return res.json({ id: response.result.id, status: response.result.status });
  } catch (error) {
    console.error("[PayPal] createOrder error:", error);
    return res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

/** POST /paypal/capture-order?orderID=XXX
 * Capture and echo details back
 */
export const captureOrder = async (req, res) => {
  try {
    const orderID = req.query.orderID || req.body.orderID;
    if (!orderID) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    const result = capture.result;

    const cap =
      result?.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const capCcy = cap?.amount?.currency_code;
    const capVal = cap?.amount?.value;

    // Safety log if PayPal ne kisi reason se dusri currency capture ki ho
    if (capCcy && capCcy !== MERCHANT_CCY) {
      console.warn(
        `[PayPal] Currency mismatch on capture. Expected ${MERCHANT_CCY}, got ${capCcy}`
      );
    }

    return res.json({
      ok: true,
      capture: result,
      paymentId: cap?.id,
      currency: capCcy,
      value: capVal,
    });
  } catch (error) {
    console.error("[PayPal] captureOrder error:", error);
    return res.status(500).json({
      message: "Failed to capture PayPal order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Demo fallback (agar kabhi server-side total nikalna ho)
async function calculateBookingTotal(bookingId) {
  return 49.99;
}
