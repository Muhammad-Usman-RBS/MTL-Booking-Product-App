import { getPaypalClient, paypal } from "../../utils/settings/paypalClient.js";

const DEFAULT_CCY = "GBP";
const rawCcy = process.env.PAYPAL_CURRENCY || process.env.CURRENCY || DEFAULT_CCY;
const MERCHANT_CCY = String(rawCcy).trim().toUpperCase();
const ZERO_DEC = new Set(["JPY", "TWD", "HUF"]);
const fmtAmount = (val, ccy) =>
  ZERO_DEC.has((ccy || "").toUpperCase())
    ? String(Math.round(Number(val || 0)))
    : Number(val || 0).toFixed(2);

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
        .json({ message: "Paypal client ID not found in environment variables" });
    }
    res.json(cfg);
  } catch (error) {
    console.error("[Paypal] Config error:", error);
    res.status(500).json({ message: "Failed to get Paypal config" });
  }
};

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
    if (currency && currency.toUpperCase() !== MERCHANT_CCY) {
      return res
        .status(400)
        .json({ message: `Currency mismatch. Expected ${MERCHANT_CCY}` });
    }
    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(bookingId),
          amount: {
            currency_code: MERCHANT_CCY,
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
    console.error("[Paypal] createOrder error:", error);
    return res.status(500).json({ message: "Failed to create Paypal order" });
  }
};

export const captureOrder = async (req, res) => {
  try {
    const orderID = req.query.orderID || req.body.orderID;
    if (!orderID) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);
    const result = capture.result;
    const cap =
      result?.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const capCcy = cap?.amount?.currency_code;
    const capVal = cap?.amount?.value;
    if (capCcy && capCcy !== MERCHANT_CCY) {
      console.warn(
        `[Paypal] Currency mismatch on capture. Expected ${MERCHANT_CCY}, got ${capCcy}`
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
    console.error("[Paypal] captureOrder error:", error);
    return res.status(500).json({
      message: "Failed to capture Paypal order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function calculateBookingTotal(bookingId) {
  return 49.99;
}