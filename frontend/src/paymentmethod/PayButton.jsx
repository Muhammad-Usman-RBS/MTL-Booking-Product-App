import React from "react";
import { useCreateCheckoutSessionMutation } from "../redux/api/stripeApi";
import { loadStripe } from "@stripe/stripe-js";

// Load publishable key from env (frontend only)
const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

export default function PayButton({
  bookingId,
  customerEmail,
  priceId,
  quantity = 1,
  onError,
}) {
  const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();

  const handlePay = async () => {
    try {
      if (!stripePromise) {
        throw new Error(
          "Stripe publishable key missing. Set VITE_STRIPE_PUBLISHABLE_KEY in Netlify env."
        );
      }
      if (!priceId) {
        throw new Error("Missing priceId for Stripe line item.");
      }

      // Call your API (server validates items/amounts)
      const { data, error } = await createSession({
        items: [{ priceId, quantity: Math.max(1, Math.min(99, quantity)) }],
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

      // Preferred: use sessionId (works with your latest controller)
      if (data?.id) {
        const { error: redirectErr } = await stripe.redirectToCheckout({
          sessionId: data.id,
        });
        if (redirectErr) throw new Error(redirectErr.message);
        return;
      }

      // Fallback: if API returns a direct URL
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
