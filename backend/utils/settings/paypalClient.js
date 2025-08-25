// utils/paypalClient.js
import paypal from '@paypal/checkout-server-sdk';

export function getPayPalClient() {
  const env =
    (process.env.PAYPAL_MODE || 'sandbox') === 'live'
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

export { paypal }; // classes reuse ke liye (OrdersCreateRequest, etc.)
