import { apiSlice } from '../apiSlice';

export const generalPricingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch general pricing data
    getGeneralPricing: builder.query({
      query: () => ({
        url: '/pricing/general',
        method: 'GET',
      }),
      providesTags: ['GeneralPricing'],
    }),

    // Create or update general pricing
    updateGeneralPricing: builder.mutation({
      query: (formData) => ({
        url: '/pricing/general',
        method: 'POST',
        body: { ...formData, type: 'general' },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['GeneralPricing'],
    }),
  }),
});

export const {
  useGetGeneralPricingQuery,
  useUpdateGeneralPricingMutation,
} = generalPricingApi;
