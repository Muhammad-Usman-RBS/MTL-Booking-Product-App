// utils/paypalClient.js
import paypal from '@paypal/checkout-server-sdk';

export function getPayPalClient() {
  // Debug logs to confirm .env values are loaded
  console.log("====================================");
  console.log("[PayPal] MODE:", process.env.PAYPAL_MODE);
  console.log("[PayPal] CURRENCY:", process.env.PAYPAL_CURRENCY);
  console.log("[PayPal] CLIENT_ID set?:", !!process.env.PAYPAL_CLIENT_ID);
  console.log("[PayPal] CLIENT_SECRET set?:", !!process.env.PAYPAL_CLIENT_SECRET);
  console.log("====================================");

  const env =
    (process.env.PAYPAL_MODE || "sandbox") === "live"
      ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
      : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

  return new paypal.core.PayPalHttpClient(env);
}

// export paypal SDK for reuse (OrdersCreateRequest, etc.)
export { paypal };
