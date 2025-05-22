import { apiSlice } from '../apiSlice';

export const hourlyPricingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllHourlyRates: builder.query({
      query: (companyId) => ({
        url: '/pricing/getAllHourlyRates',
        method: 'GET',
        params: { companyId },
      }),
      providesTags: ['HourlyRates'],
    }),
    addHourlyPackage: builder.mutation({
      query: (newData) => ({
        url: '/pricing/addHourlyPackage',
        method: 'POST',
        body: newData,
      }),
      invalidatesTags: ['HourlyRates'],
    }),
    updateHourlyPackage: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/pricing/updateHourlyPackage/${id}`,
        method: 'PUT',
        body: updatedData,
      }),
      invalidatesTags: ['HourlyRates'],
    }),
    deleteHourlyPackage: builder.mutation({
      query: (id) => ({
        url: `/pricing/delHourlyPackage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HourlyRates'],
    }),
  }),
});

export const {
  useGetAllHourlyRatesQuery,
  useAddHourlyPackageMutation,
  useUpdateHourlyPackageMutation,
  useDeleteHourlyPackageMutation,
} = hourlyPricingApi;
