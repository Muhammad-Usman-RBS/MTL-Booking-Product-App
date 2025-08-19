import { apiSlice } from "../slices/apiSlice";

export const reviewsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Load current review settings for a company
        getReviewSettings: builder.query({
            query: (companyId) => ({
                url: `/reviews/settings`,
                method: "GET",
                params: { companyId },
            }),
            providesTags: (result, error, companyId) => [{ type: "ReviewSettings", id: companyId }],
        }),

        // ✅ Update (or create) review settings
        updateReviewSettings: builder.mutation({
            query: ({ companyId, subject, template, reviewLink }) => ({
                url: `/reviews/settings`,
                method: "PUT",
                body: { companyId, subject, template, reviewLink },
            }),
            invalidatesTags: (result, error, { companyId }) => [{ type: "ReviewSettings", id: companyId }],
        }),

        // ✅ Send review email for a specific booking (manual trigger)
        sendReviewEmail: builder.mutation({
            query: (bookingMongoId) => ({
                url: `/reviews/send/${bookingMongoId}`,
                method: "POST",
            }),
            // No cache to invalidate here, but you can add a toast on success in component
        }),
    }),
});

export const {
    useGetReviewSettingsQuery,
    useUpdateReviewSettingsMutation,
    useSendReviewEmailMutation,
} = reviewsApi;
