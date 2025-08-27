// components/payment/StripeCheckout.jsx
import React, { useMemo, useRef } from "react";
import { useCreateCheckoutSessionMutation } from "../redux/api/stripeApi";
import { loadStripe } from "@stripe/stripe-js";

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;
const DEFAULT_PRICE_ID = import.meta.env.VITE_STRIPE_DEFAULT_PRICE_ID || "";

const clampQty = (q) => Math.min(Math.max(Math.floor(q || 1), 1), 99);

// Stripe minimums in MINOR units (e.g., 50 = $0.50, 5000 = ₹50)
const MIN_MINOR = { usd: 50, eur: 50, gbp: 50, inr: 5000, aed: 200 };

const StripeCheckout = ({
  bookingId,
  customerEmail,
  priceId,                 // optional
  quantity = 1,
  onError,
  onBeforeRedirect,        // only stash payload / create booking etc.
  disabled = false,
  amount,                  // major units if no priceId
  currency,                // required if no priceId (e.g., "GBP","INR")
  itemName = "Ride Fare",

  // optional: override where Stripe should return
  successPath,             // e.g. "/widget"
  cancelPath,              // e.g. "/widget"
}) => {
  const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const clicking = useRef(false);

  const { successUrl, cancelUrl } = useMemo(() => {
    const origin = window.location.origin;
    const path = (p) => (p || window.location.pathname);
    const toUrl = (p, flag) => {
      const u = new URL(origin + path(p));
      u.searchParams.set("payment", flag);
      return u.toString();
    };
    return {
      successUrl: toUrl(successPath, "stripe_success"),
      cancelUrl: toUrl(cancelPath, "stripe_cancelled"),
    };
  }, [successPath, cancelPath]);


  const handlePay = async () => {
    if (disabled || isLoading || clicking.current) return;

    try {
      clicking.current = true;

      if (!stripePromise) {
        throw new Error("Stripe publishable key missing.");
      }

      const idToUse = priceId || DEFAULT_PRICE_ID;
      let items;

      if (!idToUse) {
        if (!currency) throw new Error("Payment currency is not configured.");
        const cur = String(currency).trim().toLowerCase();
        // accept amount OR amountMajor (backward-compat)
        const major = Number((amount ?? amountMajor ?? 0));
        const amountMinor = Math.round(major * 100);
        const minMinor = MIN_MINOR[cur] ?? 50;

        if (!Number.isFinite(amountMinor) || amountMinor < minMinor) {
          const prettyMin =
            cur === "inr" ? "₹50" :
              cur === "aed" ? "AED 2.00" :
                "about 0.50 in local currency";
          throw new Error(`Amount too low for ${currency}. Minimum is ${prettyMin}.`);
        }

        items = [{
          name: itemName || "Ride Fare",
          amount: amountMinor,
          currency: cur,
          quantity: clampQty(quantity),
        }];
      } else {
        items = [{ priceId: String(idToUse), quantity: clampQty(quantity) }];
      }

      // Before redirect: let parent save booking / stash payload
      if (typeof onBeforeRedirect === "function") {
        await onBeforeRedirect();
      }

      // Create Checkout Session (server should set:
      //  - mode: 'payment'
      //  - success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`
      //  - cancel_url: cancelUrl
      //  - DO NOT send 'locale' or 'payment_method_types'
      //  - Prefer automatic_payment_methods.enabled = true
      const res = await createSession({
        items,
        bookingId,
        customerEmail,
        successUrl,
        cancelUrl,
      });

      const data = res?.data;
      const err = res?.error;
      if (err) {
        const msg = err?.data?.message || err?.error || "Failed to create session.";
        throw new Error(msg);
      }
      if (!data?.id && !data?.url) {
        throw new Error("Stripe session not returned.");
      }

      const stripe = await stripePromise;

      if (data?.id) {
        const { error: redirectErr } = await stripe.redirectToCheckout({ sessionId: data.id });
        if (redirectErr) throw new Error(redirectErr.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("[StripeCheckout] init error:", e);
      if (typeof onError === "function") onError(e);
      else alert(e.message || "Payment could not be started.");
    } finally {
      // keep disabled during navigation; re-enable only on real error
      clicking.current = false;
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? "true" : "false"}
      aria-disabled={isLoading || disabled ? "true" : "false"}
      className="w-full bg-black hover:opacity-90 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Starting Checkout…
        </>
      ) : (
        "Pay with Card / Bank (Stripe)"
      )}
    </button>
  );
};

export default StripeCheckout;