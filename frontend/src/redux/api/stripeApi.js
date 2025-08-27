// src/redux/api/stripeApi.js
import { apiSlice } from "../slices/apiSlice";

export const stripeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        /**
         * 1) Create Stripe Checkout Session
         * POST /api/stripe/create-checkout-session
         * @payload { items, bookingId, customerEmail, mode? }
         */
        createCheckoutSession: builder.mutation({
            query: (payload) => ({
                url: `/stripe/create-checkout-session`,
                method: "POST",
                body: payload,
            }),
            transformResponse: (response) => {
                // Expect { id, url } from server
                if (!response?.id && !response?.url) {
                    console.error("[Stripe API] Invalid response:", response);
                }
                return response;
            },
            invalidatesTags: ["Stripe"],
        }),

        /**
         * 2) Retrieve Checkout Session detail/status
         * GET /api/stripe/session/:sessionId
         */
        getCheckoutSession: builder.query({
            query: (sessionId) => ({
                url: `/stripe/session/${sessionId}`,
                method: "GET",
            }),
            transformResponse: (response) => {
                // Debug session
                if (!response?.id) {
                    console.warn("[Stripe API] No session id in response", response);
                }
                return response;
            },
            providesTags: ["Stripe"],
        }),

        /**
         * 3) Get publishable key from server (recommended for security)
         * GET /api/stripe/pk
         */
        getPublishableKey: builder.query({
            query: () => ({
                url: `/stripe/pk`,
                method: "GET",
            }),
            transformResponse: (response) => {
                if (!response?.pk) {
                    console.error("[Stripe API] Publishable key missing in response");
                }
                return response;
            },
            providesTags: ["Stripe"],
        }),

        /**
         * 4) Create Billing Portal Session (for subscriptions)
         * POST /api/stripe/portal-session
         */
        createPortalSession: builder.mutation({
            query: ({ customerId, returnUrl }) => ({
                url: `/stripe/portal-session`,
                method: "POST",
                body: { customerId, returnUrl },
            }),
            transformResponse: (response) => {
                if (!response?.url) {
                    console.error("[Stripe API] Portal session did not return a URL");
                }
                return response;
            },
            invalidatesTags: ["Stripe"],
        }),

        /**
         * 5) List active Products
         * GET /api/stripe/products?active=true
         */
        listProducts: builder.query({
            query: ({ active = true } = {}) => ({
                url: `/stripe/products?active=${active}`,
                method: "GET",
            }),
            transformResponse: (response) => response?.data || response,
            providesTags: ["Stripe"],
        }),

        /**
         * 6) List Prices (optionally filter by product)
         * GET /api/stripe/prices?product=prod_xxx&active=true
         */
        listPrices: builder.query({
            query: ({ product, active = true } = {}) => {
                const q = new URLSearchParams();
                if (product) q.set("product", product);
                if (active !== undefined) q.set("active", String(active));
                return {
                    url: `/stripe/prices?${q.toString()}`,
                    method: "GET",
                };
            },
            transformResponse: (response) => response?.data || response,
            providesTags: ["Stripe"],
        }),

        /**
         * 7) Refund a payment (admin use)
         * POST /api/stripe/refund
         */
        refundPayment: builder.mutation({
            query: ({ paymentIntentId, amount }) => ({
                url: `/stripe/refund`,
                method: "POST",
                body: { paymentIntentId, amount },
            }),
            transformResponse: (response) => {
                if (!response?.id) {
                    console.error("[Stripe API] Refund response missing ID", response);
                }
                return response;
            },
            invalidatesTags: ["Stripe"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateCheckoutSessionMutation,
    useGetCheckoutSessionQuery,
    useGetPublishableKeyQuery,
    useCreatePortalSessionMutation,
    useListProductsQuery,
    useListPricesQuery,
    useRefundPaymentMutation,
} = stripeApi;
