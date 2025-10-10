import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { getPaypalClient } from './paypalClient.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/paypal/config', (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    currency: 'GBP',
    mode: process.env.PAYPAL_MODE,
  });
});

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const total = 49.99;
    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
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
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID } = req.query;
    const client = getPaypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);
    return res.json({ ok: true, capture: capture.result });
  } catch (err) {
    console.error('Capture Order Error:', err);
    return res.status(500).json({ message: 'Failed to capture order' });
  }
});
app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on ${process.env.PORT || 5000}`)
);
