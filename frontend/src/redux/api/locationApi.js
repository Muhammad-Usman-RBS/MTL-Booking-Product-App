import { apiSlice } from "../apiSlice";

export const locationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createLocation: builder.mutation({
      query: (payload) => ({
        url: "/settings/create-location",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Location"],
    }),

    getAllLocations: builder.query({
      query: (companyId) => ({
        url: `/settings/get-all-locations?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: ['Location']
    }),

    getLocationById: builder.query({
      query: (id) => ({
        url: `/settings/get-location/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Location", id }],
    }),

    updateLocationById: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/settings/update-location/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ['Location']
    }),

    deleteLocationById: builder.mutation({
      query: (id) => ({
        url: `/settings/delete-location/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Location']
    }),
  }),
  tagTypes: ["Location"],
});

export const {
  useCreateLocationMutation,
  useGetAllLocationsQuery,
  useGetLocationByIdQuery,
  useUpdateLocationByIdMutation,
  useDeleteLocationByIdMutation,
} = locationApi;
