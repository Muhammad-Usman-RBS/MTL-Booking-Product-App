import crypto from "crypto";
import stripe from "../../config/stripe.js";

const uuid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex"));
const clampQty = (q) => Math.min(Math.max(parseInt(q ?? 1, 10) || 1, 1), 99);
const toMinor = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) throw Object.assign(new Error("Invalid amount"), { status: 400 });
    return Math.round(v);
};

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


const normalizeSuccessUrl = (url) => {
    if (!url) return url;
    if (url.includes("{CHECKOUT_SESSION_ID}")) return url;
    try {
        const u = new URL(url);
        if (u.searchParams.has("session_id")) return url;
        u.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        return u.toString();
    } catch {
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}session_id={CHECKOUT_SESSION_ID}`;
    }
};

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
        const line_items = items.map((it) => {
            const quantity = clampQty(it.quantity);
            if (it.priceId) {
                return { price: String(it.priceId), quantity };
            }
            const currency = String(it.currency || "gbp").toLowerCase();
            const unit_amount = toMinor(it.amount);
            if (!Number.isInteger(unit_amount) || unit_amount < 50) {
                throw Object.assign(new Error("Invalid line item amount"), { status: 400 });
            }
            return {
                price_data: {
                    currency,
                    product_data: { name: it.name || "Item" },
                    unit_amount,
                },
                quantity,
            };
        });
        const FRONT = (process.env.BASE_URL_FRONTEND || "").replace(/\/$/, "");
        if (!FRONT && !clientSuccessUrl && !clientCancelUrl) {
            return res
                .status(500)
                .json({ message: "BASE_URL_FRONTEND is not configured and no redirect URLs were provided." });
        }
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
                mode,
                line_items,
                customer_email: customerEmail || undefined,
                customer_creation: "if_required",
                billing_address_collection: "auto",
                allow_promotion_codes: true,
                client_reference_id: `${bookingId || "no-booking"}:${Date.now()}`,
                metadata: { bookingId: String(bookingId || "") },
                payment_intent_data: { metadata: { bookingId: String(bookingId || "") } },
                success_url,
                cancel_url,
            },
            { idempotencyKey: uuid() }
        );
        return res.status(201).json({ id: session.id, url: session.url });
    } catch (err) {
        if (err?.status) return res.status(err.status).json({ message: err.message });
        return next(err);
    }
};