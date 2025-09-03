import { apiSlice } from '../slices/apiSlice';

export const paymentOptionsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Create or update payment option (admin)
        createOrUpdatePaymentOption: builder.mutation({
            query: (data) => ({
                url: `/settings/create-or-update`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PaymentOptions"],
        }),

        // ✅ Get all payment options for a company (admin panel)
        getAllPaymentOptions: builder.query({
            query: (companyId) => ({
                url: `/settings/all-options?companyId=${companyId}`,
                method: "GET",
            }),
            providesTags: ["PaymentOptions"],
        }),

        // ✅ Get single payment option
        getPaymentOption: builder.query({
            query: ({ companyId, paymentMethod }) => ({
                url: `/settings/single-option?companyId=${companyId}&paymentMethod=${paymentMethod}`,
                method: "GET",
            }),
            providesTags: ["PaymentOptions"],
        }),

        // ✅ Update payment option status (enable/disable, live/test)
        updatePaymentOptionStatus: builder.mutation({
            query: ({ paymentOptionId, isEnabled, isLive }) => ({
                url: `/settings/status/${paymentOptionId}`,
                method: "PUT",
                body: { isEnabled, isLive },
            }),
            invalidatesTags: ["PaymentOptions"],
        }),

        // ✅ Delete payment option
        deletePaymentOption: builder.mutation({
            query: (paymentOptionId) => ({
                url: `/settings/delete/${paymentOptionId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PaymentOptions"],
        }),

        // ✅ Get enabled payment options for frontend display
        getEnabledPaymentOptions: builder.query({
            query: (companyId) => ({
                url: `/settings/enabled-options?companyId=${companyId}`,
                method: "GET",
            }),
            providesTags: ["PaymentOptions"],
        }),
    }),
});

export const {
    useCreateOrUpdatePaymentOptionMutation,
    useGetAllPaymentOptionsQuery,
    useGetPaymentOptionQuery,
    useUpdatePaymentOptionStatusMutation,
    useDeletePaymentOptionMutation,
    useGetEnabledPaymentOptionsQuery,
} = paymentOptionsApi;