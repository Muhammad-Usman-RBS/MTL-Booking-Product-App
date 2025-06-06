import { apiSlice } from "../apiSlice";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ PUBLIC: Get all vehicles by companyId for iframe widget
    getPublicVehicles: builder.query({
      query: (companyId) => ({
        url: `/pricing/vehicles/public`,
        method: "GET",
        params: { companyId },
      }),
      providesTags: ["Vehicles"],
    }),

    // ✅ AUTH-PROTECTED: Get all vehicles (if used in dashboard)
    getAllVehicles: builder.query({
      query: (companyId) => ({
        url: `/pricing/vehicles`,
        method: "GET",
        params: { companyId },
      }),
      providesTags: ["Vehicles"],
    }),

    // CREATE
    createVehicle: builder.mutation({
      query: (formData) => ({
        url: "/pricing/vehicles",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Vehicles"],
    }),

    // UPDATE
    updateVehicle: builder.mutation({
      query: ({ id, formData }) => {
        const isForm = formData instanceof FormData;
        return {
          url: `/pricing/vehicles/${id}`,
          method: "PUT",
          body: formData,
          ...(isForm && {
          }),
        };
      },
      invalidatesTags: ["Vehicles"],
    }),

    // DELETE
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
  useGetPublicVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;
