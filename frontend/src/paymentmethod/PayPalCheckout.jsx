import React, { useMemo } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import currencyOptions from "../constants/constantscomponents/currencyOptions";
import {
  useGetPayPalConfigQuery,
  useCreatePayPalOrderMutation,
  useCapturePayPalOrderMutation,
} from "../redux/api/paypalApi";

// central symbol map from currencyOptions
const SYMBOL_MAP = Object.freeze(
  currencyOptions.reduce((acc, c) => {
    acc[(c.value || "").toUpperCase()] = c.symbol || "";
    return acc;
  }, { MYR: "RM", PLN: "zł", HUF: "Ft", CZK: "Kč", ILS: "₪", MXN: "MX$" })
);
const symbolFor = (ccy) => SYMBOL_MAP[(ccy || "").toUpperCase()] ?? "";

// zero-decimal handling for display
const ZERO_DEC = new Set(["JPY", "TWD", "HUF"]);
const formatDisplay = (ccy, val) =>
  ZERO_DEC.has(String(ccy).toUpperCase())
    ? String(Math.max(Number(val) || 0, 0) | 0)
    : Math.max(Number(val) || 0, 0).toFixed(2);

const PayPalCheckout = ({
  bookingId,
  amount,                  // ← REQUIRED (no default, no dummy)
  onSuccess = () => { },
  onError = () => { },
  onCancel = () => { },
  disabled = false,
}) => {
  const { data: cfg, isLoading: cfgLoading, error: cfgError } = useGetPayPalConfigQuery();
  const [createOrder, { isLoading: creating }] = useCreatePayPalOrderMutation();
  const [captureOrder, { isLoading: capturing }] = useCapturePayPalOrderMutation();

  const amountNum = Number(amount);
  const isAmountValid = Number.isFinite(amountNum) && amountNum > 0;

  const options = useMemo(() => {
    if (!cfg?.clientId) return null;
    return {
      "client-id": cfg.clientId,
      currency: (cfg.currency || "GBP").toUpperCase(),  // ← ONLY backend currency
      intent: "capture",
      components: "buttons",
    };
  }, [cfg]);

  if (cfgLoading) return <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>Loading PayPal configuration...</div>;
  if (cfgError) return <div style={{ padding: 16, border: "1px solid #e11", color: "#a00", borderRadius: 8 }}>PayPal configuration error: {typeof cfgError === "string" ? cfgError : JSON.stringify(cfgError)}</div>;
  if (!cfg?.clientId || !options) return <div style={{ padding: 16, border: "1px solid #f90", color: "#a60", borderRadius: 8 }}>PayPal client configuration missing.</div>;

  const ccy = options.currency;
  const display = formatDisplay(ccy, amountNum);
  const ccySymbol = symbolFor(ccy);

  return (
    // key={options.currency} → agar backend currency change ho to script re-load ho
    <PayPalScriptProvider options={options} key={options.currency}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h4 style={{ margin: 0 }}>
          Pay {ccySymbol}{display} {ccySymbol ? "" : ccy}
        </h4>

        <div style={{ width: 260, minWidth: 220 }}>
          <PayPalButtons
            style={{ layout: "horizontal", height: 40, color: "gold", shape: "rect" }}
            disabled={disabled || creating || capturing || !isAmountValid}
            forceReRender={[bookingId, ccy, display]}
            createOrder={async () => {
              try {
                const res = await createOrder({
                  bookingId: bookingId || "temp-booking-id",
                  amount: amountNum,               // ← sirf real amount
                  // currency NOT sent; server decides
                }).unwrap();
                if (!res?.orderId) throw new Error("Server did not return orderId");
                return res.orderId;
              } catch (error) { onError(error); throw error; }
            }}
            onApprove={async (data) => {
              try {
                const res = await captureOrder({ orderId: data.orderID }).unwrap();
                res?.ok ? onSuccess(res.capture) : onError(new Error("Payment capture failed"));
              } catch (error) { onError(error); }
            }}
            onError={(err) => onError(err)}
            onCancel={() => onCancel()}
          />
        </div>
      </div>
      {!isAmountValid && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#b45309" }}>
          Amount required: positive number &gt; 0
        </div>
      )}
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;
