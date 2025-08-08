  import { apiSlice } from '../slices/apiSlice';

  export const generalPricingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

      // Fetch general pricing for the logged-in user's company
      getGeneralPricing: builder.query({
        query: () => ({
          url: '/pricing/general',
          method: 'GET',
        }),
        providesTags: ['GeneralPricing'],
      }),

        // Fetch general pricing for a specific company (public API - no authentication required)
        getGeneralPricingPublic: builder.query({
          query: (companyId) => ({
            url: `/pricing/general/widget?companyId=${companyId}`, // Public endpoint for general pricing by companyId
            method: 'GET',
          }),
          providesTags: ['GeneralPricing'],
        }),

      // Update or create general pricing for the logged-in user's company
      updateGeneralPricing: builder.mutation({
        query: (formData) => ({
          url: '/pricing/general',
          method: 'POST',
          body: formData, // 'type' and 'companyId' will be handled on backend
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
    useGetGeneralPricingPublicQuery, // Hook for fetching general pricing publicly by companyId
    useUpdateGeneralPricingMutation,
  } = generalPricingApi;
