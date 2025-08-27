import crypto from "crypto";
import stripe from "../../config/stripe.js";

// ---- helpers ----
const uuid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex"));

const clampQty = (q) => Math.min(Math.max(parseInt(q ?? 1, 10) || 1, 1), 99);

// If you send minor units already (e.g. 500 = £5), we just validate it's an integer
const toMinor = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) throw Object.assign(new Error("Invalid amount"), { status: 400 });
    return Math.round(v);
};

/**
 * Basic URL guard. Allows only http/https and returns null if invalid.
 */
const safeHttpUrl = (maybeUrl) => {
    try {
        if (!maybeUrl) return null;
        const u = new URL(maybeUrl);
        if (u.protocol !== "http:" && u.protocol !== "https:") return null;
        return u.toString();
    } catch {
        return null;
    }
};

/**
 * Ensure success URL contains a placeholder for the session id.
 * If "{CHECKOUT_SESSION_ID}" is missing AND no explicit session_id param exists,
 * append ?session_id={CHECKOUT_SESSION_ID} (or & if needed).
 */
const normalizeSuccessUrl = (url) => {
    if (!url) return url;
    if (url.includes("{CHECKOUT_SESSION_ID}")) return url;

    try {
        const u = new URL(url);
        // already has a session_id param? keep it
        if (u.searchParams.has("session_id")) return url;

        // otherwise add the placeholder
        u.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        return u.toString();
    } catch {
        // if URL parsing fails, just append best-effort
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}session_id={CHECKOUT_SESSION_ID}`;
    }
};

// ---- controller ----
export const createCheckoutSession = async (req, res, next) => {
    try {
        const {
            items = [],
            bookingId = "",
            customerEmail,
            mode = "payment",
            successUrl: clientSuccessUrl,
            cancelUrl: clientCancelUrl,
        } = req.body ?? {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "At least one line item is required." });
        }

        // Build Stripe line_items
        const line_items = items.map((it) => {
            const quantity = clampQty(it.quantity);

            // Prefer a Price ID from Stripe dashboard
            if (it.priceId) {
                return { price: String(it.priceId), quantity };
            }

            // Fallback: explicit price_data using minor units
            const currency = String(it.currency || "gbp").toLowerCase();
            const unit_amount = toMinor(it.amount);
            if (!Number.isInteger(unit_amount) || unit_amount < 50) {
                // guard tiny/invalid amounts; adjust threshold as per your business
                throw Object.assign(new Error("Invalid line item amount"), { status: 400 });
            }

            return {
                price_data: {
                    currency,
                    product_data: { name: it.name || "Item" },
                    unit_amount, // smallest unit (e.g., 500 = £5.00)
                },
                quantity,
            };
        });

        // Frontend base (fallback)
        const FRONT = (process.env.BASE_URL_FRONTEND || "").replace(/\/$/, "");
        if (!FRONT && !clientSuccessUrl && !clientCancelUrl) {
            return res
                .status(500)
                .json({ message: "BASE_URL_FRONTEND is not configured and no redirect URLs were provided." });
        }

        // Prefer client-provided URLs if valid; else fallback to FRONT
        const safeSuccessFromClient = safeHttpUrl(clientSuccessUrl);
        const safeCancelFromClient = safeHttpUrl(clientCancelUrl);

        const success_url = normalizeSuccessUrl(
            safeSuccessFromClient || (FRONT ? `${FRONT}/payment/success` : null)
        );
        const cancel_url = safeCancelFromClient || (FRONT ? `${FRONT}/payment/cancel` : null);

        if (!success_url || !cancel_url) {
            return res.status(500).json({
                message:
                    "Unable to resolve success/cancel URLs. Provide valid URLs in the request or set BASE_URL_FRONTEND.",
            });
        }

        const session = await stripe.checkout.sessions.create(
            {
                mode, // "payment" | "subscription"
                line_items,
                customer_email: customerEmail || undefined,
                customer_creation: "if_required",
                billing_address_collection: "auto",
                allow_promotion_codes: true,

                // helpful for correlating in logs/DB
                client_reference_id: `${bookingId || "no-booking"}:${Date.now()}`,
                metadata: { bookingId: String(bookingId || "") },
                payment_intent_data: { metadata: { bookingId: String(bookingId || "") } },

                success_url,
                cancel_url,
            },
            // RANDOM idempotency => har attempt par naya session (multiple tests allowed)
            { idempotencyKey: uuid() }
        );

        // Return both id + url (url is handy for debugging)
        return res.status(201).json({ id: session.id, url: session.url });
    } catch (err) {
        if (err?.status) return res.status(err.status).json({ message: err.message });
        return next(err);
    }
};
