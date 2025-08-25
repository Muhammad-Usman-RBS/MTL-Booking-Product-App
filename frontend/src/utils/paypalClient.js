import paypal from '@paypal/checkout-server-sdk';

export function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials missing in environment variables');
  }
  
  const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  
  return new paypal.core.PayPalHttpClient(environment);
}

// Export paypal for use in controllers
export { paypal };

// 2. FIXED PayPal Controller (paypalController.js)
import { getPayPalClient, paypal } from '../../utils/settings/paypalClient.js';

async function calculateBookingTotal(bookingId) {
  // TODO: DB se booking read karke server-side total compute karein
  return 49.99; // DEMO
}

export const getConfig = (req, res) => {
  console.log("🔍 PayPal config API called");
  console.log("Environment variables:");
  console.log("PAYPAL_CLIENT_ID:", process.env.PAYPAL_CLIENT_ID ? "SET" : "MISSING");
  console.log("PAYPAL_CLIENT_SECRET:", process.env.PAYPAL_CLIENT_SECRET ? "SET" : "MISSING");
  console.log("PAYPAL_MODE:", process.env.PAYPAL_MODE);
  console.log("PAYPAL_CURRENCY:", process.env.PAYPAL_CURRENCY);
  
  try {
    const config = {
      clientId: process.env.PAYPAL_CLIENT_ID,
      currency: process.env.PAYPAL_CURRENCY || 'GBP',
      mode: process.env.PAYPAL_MODE || 'sandbox',
    };
    
    console.log("Config being sent to frontend:", config);
    
    if (!config.clientId) {
      console.log("❌ Client ID missing!");
      return res.status(500).json({ message: 'PayPal client ID not configured' });
    }
    
    console.log("✅ Config sent successfully");
    res.json(config);
  } catch (error) {
    console.error('[PayPal] Config error:', error);
    res.status(500).json({ message: 'Failed to get PayPal config' });
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

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId.toString(),
          amount: {
            currency_code: process.env.PAYPAL_CURRENCY || "GBP",
            value: total.toFixed(2),
          },
          description: `Booking payment for booking ID: ${bookingId}`,
        },
      ],
      application_context: {
        brand_name: "Your Business Name",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: "https://yoursite.com/success", // Add your URLs
        cancel_url: "https://yoursite.com/cancel"
      }
    });

    const response = await client.execute(request);
    console.log('[PayPal] Order created:', response.result.id);
    
    return res.json({ 
      id: response.result.id,
      status: response.result.status 
    });
  } catch (error) {
    console.error("[PayPal] createOrder error:", error);
    console.error("[PayPal] Error details:", error.message);
    return res.status(500).json({ 
      message: "Failed to create PayPal order",
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

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);
    const result = capture.result;
    
    console.log('[PayPal] Order captured:', result.id, result.status);

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
    console.error('[PayPal] captureOrder error:', error);
    console.error('[PayPal] Error details:', error.message);
    return res.status(500).json({ 
      message: 'Failed to capture PayPal order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};