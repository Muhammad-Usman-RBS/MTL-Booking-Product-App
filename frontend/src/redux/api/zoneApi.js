import { apiSlice } from '../slices/apiSlice';

export const zoneApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET all zones
    getAllZones: builder.query({
      query: () => ({ url: '/pricing/zones', method: 'GET' }),
      providesTags: ['Zones'],
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }),

    // CREATE zone
    createZone: builder.mutation({
      query: (newZone) => ({ url: '/pricing/zones', method: 'POST', body: newZone }),
      invalidatesTags: ['Zones'],
    }),

    // UPDATE zone
    updateZone: builder.mutation({
      query: ({ id, ...updatedZone }) => ({
        url: `/pricing/zones/${id}`,
        method: 'PUT',
        body: updatedZone,
      }),
      invalidatesTags: ['Zones'],
    }),

    // DELETE zone
    deleteZone: builder.mutation({
      query: (id) => ({ url: `/pricing/zones/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Zones'],
    }),

    // 🔄 SYNC one zone -> dependents
    syncZone: builder.mutation({
      query: (id) => ({ url: `/pricing/zones/${id}/sync`, method: 'POST' }),
      // if your UI lists zones after sync, just invalidate zones
      // if you also show fixed prices, add 'FixedPrices' to your api baseTagTypes and include it here too
      invalidatesTags: ['Zones'],
    }),

    // 🔄 SYNC all zones (company-wide)
    syncAllZones: builder.mutation({
      query: () => ({ url: `/pricing/zones/sync-all`, method: 'POST' }),
      invalidatesTags: ['Zones'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetAllZonesQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,

  useSyncZoneMutation,
  useSyncAllZonesMutation,
} = zoneApi;
