// redux/api/vehicleApi.js

import { apiSlice } from "../apiSlice";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVehicles: builder.query({
      query: (companyId) => ({
        url: "/pricing/vehicles",
        method: "GET",
        params: { companyId }, // ✅ Pass it in query
      }),
      providesTags: ["Vehicles"],
    }),

    createVehicle: builder.mutation({
      query: (formData) => ({
        url: "/pricing/vehicles",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Vehicles"],
    }),

    updateVehicle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/pricing/vehicles/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Vehicles"],
    }),

    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/pricing/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicles"],
    }),
  }),
});

export const {
  useGetAllVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;
