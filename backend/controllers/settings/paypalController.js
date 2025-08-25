// Environment Variables Based PayPal Controller
import { getPayPalClient, paypal } from '../../utils/settings/paypalClient.js';

// Simple environment-based config (no database)
export const getConfig = (req, res) => {
  console.log("PayPal config API called");
  console.log("Environment variables:");
  console.log("PAYPAL_CLIENT_ID:", process.env.PAYPAL_CLIENT_ID ? "SET" : "MISSING");
  console.log("PAYPAL_CLIENT_SECRET:", process.env.PAYPAL_CLIENT_SECRET ? "SET" : "MISSING");
  console.log("PAYPAL_MODE:", process.env.PAYPAL_MODE);
  console.log("PAYPAL_CURRENCY:", process.env.PAYPAL_CURRENCY);
  
  try {
    // Direct environment variable usage
    const config = {
      clientId: process.env.PAYPAL_CLIENT_ID,
      currency: process.env.PAYPAL_CURRENCY || 'GBP',
      mode: process.env.PAYPAL_MODE || 'sandbox',
    };
    
    console.log("Config being sent to frontend:", config);
    
    if (!config.clientId) {
      console.log("❌ Client ID missing from environment variables!");
      return res.status(500).json({ 
        message: 'PayPal client ID not found in environment variables' 
      });
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

    // Use environment variables
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
    });

    const response = await client.execute(request);
    console.log('[PayPal] Order created:', response.result.id);
    
    return res.json({ 
      id: response.result.id,
      status: response.result.status 
    });
  } catch (error) {
    console.error("[PayPal] createOrder error:", error);
    return res.status(500).json({ 
      message: "Failed to create PayPal order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

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
    
    console.log('[PayPal] Order captured:', result.id, result.status);

    return res.json({ 
      ok: true, 
      capture: result,
      paymentId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    });
  } catch (error) {
    console.error('[PayPal] captureOrder error:', error);
    return res.status(500).json({ 
      message: 'Failed to capture PayPal order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function calculateBookingTotal(bookingId) {
  return 49.99; // DEMO
}