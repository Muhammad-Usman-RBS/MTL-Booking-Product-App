import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import PaymentMethodSection from "./PaymentMethodSection";

const PaymentOptions = () => {
  const [cashLive, setCashLive] = useState(true);
  const [paypalLive, setPaypalLive] = useState(true);
  const [stripeLive, setStripeLive] = useState(true);
  const [squareLive, setSquareLive] = useState(true);
  const [sumupLive, setSumupLive] = useState(true);
  const [rmsLive, setRmsLive] = useState(true);
  const [vivaLive, setVivaLive] = useState(true);
  const [mollieLive, setMollieLive] = useState(true);
  const [cashChecked, setCashChecked] = useState(false);
  const [paypalChecked, setPaypalChecked] = useState(false);
  const [stripeChecked, setStripeChecked] = useState(false);
  const [squareChecked, setSquareChecked] = useState(false);
  const [sumupChecked, setSumupChecked] = useState(false);
  const [rmsChecked, setRmsChecked] = useState(false);
  const [vivaChecked, setVivaChecked] = useState(false);
  const [mollieChecked, setMollieChecked] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full space-y-8">
        <OutletHeading name="Payment Options" />

        <div className="space-y-6">
          <PaymentMethodSection
            name="Cash"
            checked={cashChecked}
            setChecked={setCashChecked}
            isLive={cashLive}
            toggleLive={() => setCashLive(!cashLive)}
            fields={[{ label: "Title", value: "Cash" }]}
          />

          <PaymentMethodSection
            name="PayPal"
            checked={paypalChecked}
            setChecked={setPaypalChecked}
            isLive={paypalLive}
            toggleLive={() => setPaypalLive(!paypalLive)}
            fields={[
              { label: "Title", value: "Pay Via PayPal" },
              { label: "Client ID" },
              { label: "Client Secret" },
            ]}
          />

          <PaymentMethodSection
            name="Stripe"
            checked={stripeChecked}
            setChecked={setStripeChecked}
            isLive={stripeLive}
            toggleLive={() => setStripeLive(!stripeLive)}
            fields={[
              { label: "Title", value: "Pay Via Debit/Credit Card" },
              {
                label: "Publishable Key",
                value: "pk_live_LshJu4GgjSylu6jyAs5NSz",
              },
              { label: "Secret Key", value: "sadasdgdgrzcxtnmd" },
              {
                label: "Webhook Endpoint URL",
                value: "https://yourdomain.com/api/stripe/webhook",
                copyable: true,
              },
              {
                label: "Webhook Events",
                value: "checkout.session.completed, payment_intent.succeeded",
                copyable: true,
              },
              {
                label: "Webhook Signing Secret",
                value: "whsec_abc123xyz",
              },
            ]}
          />
        </div>

        <div className="flex items-center justify-center pt-8">
          <button className="btn btn-edit">Update Settings</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;