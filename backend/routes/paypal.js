import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { getPayPalClient } from './paypalClient.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Optional: client ko client-id dene ke liye (React me ScriptProvider ko)
app.get('/api/paypal/config', (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    currency: 'GBP',
    mode: process.env.PAYPAL_MODE,
  });
});

// Create Order (server-side)
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;

    // TODO: bookingId se DB se total nikalein:
    // const total = await calculateBookingTotal(bookingId);
    const total = 49.99; // demo value — isay DB se laen

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            // PayPal amount string hona chahiye, do decimals
            value: total.toFixed(2),
          },
        },
      ],
    });

    const response = await client.execute(request);
    return res.json({ id: response.result.id });
  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Capture Order (server-side)
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID } = req.query; // or req.body.orderID
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);

    // IMPORTANT: yahan apni DB me transaction save karein
    // Example:
    // await savePayment({
    //   orderId: capture.result.id,
    //   status: capture.result.status,
    //   amount: capture.result.purchase_units[0].payments.captures[0].amount.value,
    //   currency: capture.result.purchase_units[0].payments.captures[0].amount.currency_code,
    //   payer: capture.result.payer.email_address,
    //   raw: capture.result
    // });

    return res.json({ ok: true, capture: capture.result });
  } catch (err) {
    console.error('Capture Order Error:', err);
    return res.status(500).json({ message: 'Failed to capture order' });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on ${process.env.PORT || 5000}`)
);
