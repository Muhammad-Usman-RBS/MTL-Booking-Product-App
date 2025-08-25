import React, { useMemo, useEffect } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import {
  useGetPayPalConfigQuery,
  useCreatePayPalOrderMutation,
  useCapturePayPalOrderMutation,
} from "../redux/api/paypalApi";

export default function PayPalCheckout({
  bookingId,
  amount = 5.0,
  currencyOverride,
  onSuccess = () => {},
  onError = () => {},
  onCancel = () => {},
  disabled = false,
}) {
  const { data: cfg, isLoading: cfgLoading, error: cfgError } = useGetPayPalConfigQuery();
  const [createOrder, { isLoading: creating }] = useCreatePayPalOrderMutation();
  const [captureOrder, { isLoading: capturing }] = useCapturePayPalOrderMutation();

  // 🔍 DEBUG: Log everything
  useEffect(() => {
    console.log("=== PAYPAL DEBUG ===");
    console.log("cfgLoading:", cfgLoading);
    console.log("cfg:", cfg);
    console.log("cfgError:", cfgError);
    console.log("cfg?.clientId:", cfg?.clientId);
    console.log("==================");
  }, [cfg, cfgLoading, cfgError]);

  const options = useMemo(() => {
    console.log("Creating options with cfg:", cfg);
    if (!cfg?.clientId) {
      console.log("No clientId found, returning null");
      return null;
    }
    const opts = { 
      "client-id": cfg.clientId, 
      currency: currencyOverride || cfg.currency || "GBP",
      intent: "capture",
    };
    console.log("PayPal options created:", opts);
    return opts;
  }, [cfg, currencyOverride]);

  // Loading state
  if (cfgLoading) {
    return <div style={{padding: '20px', border: '1px solid #ccc'}}>
      Loading PayPal configuration...
    </div>;
  }

  // Error state
  if (cfgError) {
    console.error("PayPal config error:", cfgError);
    return <div style={{padding: '20px', border: '1px solid red', color: 'red'}}>
      PayPal configuration error: {JSON.stringify(cfgError)}
      <br/>
      <small>Check browser console and server logs</small>
    </div>;
  }

  // No config
  if (!cfg) {
    return <div style={{padding: '20px', border: '1px solid orange', color: 'orange'}}>
      PayPal config is null/undefined
      <br/>
      <small>API call may have failed silently</small>
    </div>;
  }

  // No client ID
  if (!cfg.clientId) {
    return <div style={{padding: '20px', border: '1px solid orange', color: 'orange'}}>
      PayPal Client ID missing from config: {JSON.stringify(cfg)}
    </div>;
  }

  // No options
  if (!options) {
    return <div style={{padding: '20px', border: '1px solid red', color: 'red'}}>
      PayPal options could not be created
    </div>;
  }

  return (
    <PayPalScriptProvider options={options}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <h4 style={{ margin: 0 }}>
          Pay {options.currency === 'GBP' ? '£' : '$'}{amount.toFixed(2)}
        </h4>

        <div style={{ width: 260, minWidth: 220 }}>
          <PayPalButtons
            style={{ 
              layout: "horizontal", 
              height: 40,
              color: "gold",
              shape: "rect"
            }}
            disabled={disabled || creating || capturing}
            forceReRender={[amount, bookingId, options.currency]}
            
            createOrder={async () => {
              try {
                console.log('Creating PayPal order...', { bookingId, amount });
                const res = await createOrder({ 
                  bookingId: bookingId || 'test-booking', 
                  amount 
                }).unwrap();
                console.log('Order created:', res.orderId);
                return res.orderId;
              } catch (error) {
                console.error("createOrder failed:", error);
                onError(error);
                throw error;
              }
            }}
            
            onApprove={async (data, actions) => {
              try {
                console.log('Capturing PayPal order:', data.orderID);
                const res = await captureOrder({ orderId: data.orderID }).unwrap();
                console.log('Order captured:', res);
                
                if (res.ok) {
                  onSuccess(res.capture);
                } else {
                  const error = new Error("Payment capture failed");
                  onError(error);
                }
              } catch (error) {
                console.error("captureOrder failed:", error);
                onError(error);
              }
            }}
            
            onError={(err) => {
              console.error("PayPal button error:", err);
              onError(err);
            }}
            
            onCancel={() => {
              console.log("PayPal payment cancelled");
              onCancel();
            }}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
}