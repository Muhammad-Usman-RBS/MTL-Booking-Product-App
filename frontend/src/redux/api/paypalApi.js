// src/redux/api/paypalApi.js
import { apiSlice } from "../slices/apiSlice";

export const paypalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Config: clientId, currency, mode
    getPayPalConfig: builder.query({
      query: () => ({ url: `/paypal/config`, method: "GET" }),
      providesTags: ["PayPal"],
      transformResponse: (res) => ({
        clientId: res?.clientId,
        currency: res?.currency,
        mode: res?.mode || "sandbox",
      }),
    }),

    // Create order (abhi dummy amount bhej sakte ho)
    createPayPalOrder: builder.mutation({
      query: ({ bookingId, amount }) => ({
        url: `/paypal/create-order`,
        method: "POST",
        body: { bookingId, amount },
      }),
      invalidatesTags: ["PayPal"],
      transformResponse: (res) => ({ orderId: res?.id }),
    }),

    // Capture order
    capturePayPalOrder: builder.mutation({
      query: ({ orderId }) => ({
        url: `/paypal/capture-order?orderID=${orderId}`,
        method: "POST",
      }),
      invalidatesTags: ["PayPal"],
      transformResponse: (res) => ({
        ok: res?.ok,
        capture: res?.capture,
        status: res?.capture?.status,
      }),
    }),
  }),
});

export const {
  useGetPayPalConfigQuery,
  useCreatePayPalOrderMutation,
  useCapturePayPalOrderMutation,
} = paypalApi;
