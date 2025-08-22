import React from "react";
import { useCreateCheckoutSessionMutation } from "../redux/api/stripeApi";
import { loadStripe } from "@stripe/stripe-js";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

const DEFAULT_PRICE_ID = import.meta.env.VITE_STRIPE_DEFAULT_PRICE_ID || ""; // Option A
const clampQty = (q) => Math.min(Math.max(Math.floor(q || 1), 1), 99);

export default function PayButton({
  bookingId,
  customerEmail,
  priceId,           // optional now
  quantity = 1,
  onError,
  // Option B: allow overriding dummy payment via props if needed
  fallbackAmountMinor = 500,   // 500 = £5.00 (smallest unit)
  fallbackCurrency = "gbp",
  fallbackName = "Test payment",
}) {
  const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();

  const handlePay = async () => {
    try {
      if (!stripePromise) {
        throw new Error(
          "Stripe publishable key missing. Set VITE_STRIPE_PUBLISHABLE_KEY in Netlify env."
        );
      }

      // Build items with fallback
      let items;
      const idToUse = priceId || DEFAULT_PRICE_ID;
      if (idToUse) {
        // Use a Price ID if available
        items = [{ priceId: String(idToUse), quantity: clampQty(quantity) }];
      } else {
        // Fallback to explicit price_data (server will use it)
        items = [
          {
            name: fallbackName,
            amount: Number(fallbackAmountMinor), // smallest unit
            currency: fallbackCurrency,
            quantity: clampQty(quantity),
          },
        ];
      }

      // Call API
      const { data, error } = await createSession({
        items,
        bookingId,
        customerEmail,
      });

      if (error) {
        const msg =
          error?.data?.message || error?.error || "Failed to create session.";
        throw new Error(msg);
      }
      if (!data?.id && !data?.url) {
        throw new Error("Stripe session not returned from API.");
      }

      const stripe = await stripePromise;

      if (data?.id) {
        const { error: redirectErr } = await stripe.redirectToCheckout({
          sessionId: data.id,
        });
        if (redirectErr) throw new Error(redirectErr.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      console.error("[PayButton] payment init error:", e);
      if (typeof onError === "function") onError(e);
      else alert(e.message || "Payment could not be started.");
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={isLoading}
      aria-busy={isLoading ? "true" : "false"}
      aria-disabled={isLoading ? "true" : "false"}
    >
      {isLoading ? "Processing…" : "Pay via Card"}
    </button>
  );
}
