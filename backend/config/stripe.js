import "dotenv/config";
import Stripe from "stripe";

// ---- Helpers ----
const API_VERSION = "2024-06-20";
const key = (process.env.STRIPE_SECRET_KEY || "").trim();

const isValidSecret = (k) =>
    typeof k === "string" && (k.startsWith("sk_test_") || k.startsWith("sk_live_"));

if (!isValidSecret(key)) {
    const preview = key ? `${key.slice(0, 8)}…` : "EMPTY";
    throw new Error(
        `[Stripe] STRIPE_SECRET_KEY missing/invalid. Expected a key starting with "sk_test_" or "sk_live_". Got: ${preview}.
Set STRIPE_SECRET_KEY in your server environment (Render → Environment Variables).`
    );
}

// ---- Singleton Stripe client ----
const stripe = new Stripe(key, {
    apiVersion: API_VERSION,
    appInfo: { name: "MTL Booking Product App", version: "1.0.0" },
    maxNetworkRetries: 2,  // retry transient errors
    timeout: 60_000,       // 60s request timeout
});

export default stripe;
