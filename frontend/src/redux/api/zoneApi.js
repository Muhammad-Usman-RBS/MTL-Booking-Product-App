import { apiSlice } from '../apiSlice';

export const zoneApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllZones: builder.query({
      query: () => ({
        url: '/pricing/zones',
        method: 'GET',
      }),
      providesTags: ['Zones'],
    }),

    createZone: builder.mutation({
      query: (newZone) => ({
        url: '/pricing/zones',
        method: 'POST',
        body: newZone,
      }),
      invalidatesTags: ['Zones'],
    }),

    updateZone: builder.mutation({
      query: ({ id, ...updatedZone }) => ({
        url: `/pricing/zones/${id}`,
        method: 'PUT',
        body: updatedZone,
      }),
      invalidatesTags: ['Zones'],
    }),

    deleteZone: builder.mutation({
      query: (id) => ({
        url: `/pricing/zones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Zones'],
    }),

  }),
});

export const {
  useGetAllZonesQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
} = zoneApi;
