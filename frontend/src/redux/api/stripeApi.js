// src/redux/api/stripeApi.js
import { apiSlice } from "../slices/apiSlice";

export const stripeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1) Create Stripe Checkout Session
    // POST /api/stripe/create-checkout-session
    createCheckoutSession: builder.mutation({
      query: (payload) => ({
        url: `/stripe/create-checkout-session`,
        method: "POST",
        body: payload, // { items, bookingId, customerEmail, mode? }
      }),
      invalidatesTags: ["Stripe"],
    }),

    // 2) (Optional) Retrieve Checkout Session detail/status
    // GET /api/stripe/session/:sessionId
    getCheckoutSession: builder.query({
      query: (sessionId) => ({
        url: `/stripe/session/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["Stripe"],
    }),

    // 3) (Optional) Get publishable key from server (to avoid exposing in .env)
    // GET /api/stripe/pk
    getPublishableKey: builder.query({
      query: () => ({
        url: `/stripe/pk`,
        method: "GET",
      }),
      providesTags: ["Stripe"],
    }),

    // 4) (Optional) Create Billing Portal Session (for subscriptions)
    // POST /api/stripe/portal-session
    createPortalSession: builder.mutation({
      query: ({ customerId, returnUrl }) => ({
        url: `/stripe/portal-session`,
        method: "POST",
        body: { customerId, returnUrl },
      }),
      invalidatesTags: ["Stripe"],
    }),

    // 5) (Optional) List active Products
    // GET /api/stripe/products?active=true
    listProducts: builder.query({
      query: ({ active = true } = {}) => ({
        url: `/stripe/products?active=${active}`,
        method: "GET",
      }),
      providesTags: ["Stripe"],
    }),

    // 6) (Optional) List Prices (filter by product if needed)
    // GET /api/stripe/prices?product=prod_xxx&active=true
    listPrices: builder.query({
      query: ({ product, active = true } = {}) => {
        const q = new URLSearchParams();
        if (product) q.set("product", product);
        if (active !== undefined) q.set("active", String(active));
        return { url: `/stripe/prices?${q.toString()}`, method: "GET" };
      },
      providesTags: ["Stripe"],
    }),

    // 7) (Optional) Refund a payment (admin use)
    // POST /api/stripe/refund
    refundPayment: builder.mutation({
      query: ({ paymentIntentId, amount }) => ({
        url: `/stripe/refund`,
        method: "POST",
        body: { paymentIntentId, amount }, // amount in smallest unit (e.g., pence)
      }),
      invalidatesTags: ["Stripe"],
    }),
  }),
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
