import paypal from '@paypal/checkout-server-sdk';

export function getPaypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Paypal credentials missing in environment variables');
  }

  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

// Export paypal for use in controllers
export { paypal };

// 2. FIXED Paypal Controller (paypalController.js)
import { getPaypalClient, paypal } from '../../utils/settings/paypalClient.js';

async function calculateBookingTotal(bookingId) {
  // TODO: DB se booking read karke server-side total compute karein
  return 49.99; // DEMO
}

export const getConfig = (req, res) => {
  try {
    const config = {
      clientId: process.env.PAYPAL_CLIENT_ID,
      currency: process.env.PAYPAL_CURRENCY,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    };


    if (!config.clientId) {
      return res.status(500).json({ message: 'Paypal client ID not configured' });
    }

    res.json(config);
  } catch (error) {
    console.error('[Paypal] Config error:', error);
    res.status(500).json({ message: 'Failed to get Paypal config' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Amount validation
    let total;
    if (amount !== undefined) {
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      total = n;
    } else {
      total = await calculateBookingTotal(bookingId);
    }

    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId.toString(),
          amount: {
            currency_code: process.env.PAYPAL_CURRENCY,
            value: total.toFixed(2),
          },
          description: `Booking payment for booking ID: ${bookingId}`,
        },
      ],
      application_context: {
        brand_name: "Your Business Name",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: "https://yoursite.com/success", 
        cancel_url: "https://yoursite.com/cancel"
      }
    });

    const response = await client.execute(request);

    return res.json({
      id: response.result.id,
      status: response.result.status
    });
  } catch (error) {
    console.error("[Paypal] createOrder error:", error);
    console.error("[Paypal] Error details:", error.message);
    return res.status(500).json({
      message: "Failed to create Paypal order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const captureOrder = async (req, res) => {
  try {
    // Check both query and body for orderID
    const orderID = req.query.orderID || req.body.orderID;

    if (!orderID) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    const result = capture.result;


    // Save payment to database here
    // const unit = result.purchase_units?.[0];
    // const cap = unit?.payments?.captures?.[0];
    // await savePaymentToDatabase({
    //   provider: 'paypal',
    //   orderId: result.id,
    //   status: result.status,
    //   amount: cap?.amount?.value,
    //   currency: cap?.amount?.currency_code,
    //   payerEmail: result.payer?.email_address,
    //   bookingId: unit?.reference_id,
    //   raw: result,
    // });

    return res.json({
      ok: true,
      capture: result,
      paymentId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    });
  } catch (error) {
    console.error('[Paypal] captureOrder error:', error);
    console.error('[Paypal] Error details:', error.message);
    return res.status(500).json({
      message: 'Failed to capture Paypal order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};