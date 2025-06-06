import { apiSlice } from "../apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Create a new driver
    createDriver: builder.mutation({
      query: (formData) => ({
        url: "/driver/create-driver",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['DriverList'],
    }),

    // Get all drivers
    getAllDrivers: builder.query({
      query: () => ({
        url: "/driver/get-all-drivers",
      }),
      providesTags: ['DriverList'],
    }),

    // Get driver by ID
    getDriverById: builder.query({
      query: (id) => ({
        url: `/driver/getDriverById/${id}`, // ✅ Fixed template literal
      }),
      providesTags: (result, error, id) => [{ type: 'Driver', id }],
    }),

    // Delete driver by ID
    deleteDriverById: builder.mutation({
      query: (id) => ({
        url: `/driver/delete-driver/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => ['DriverList', { type: 'Driver', id }],
    }),

    // Update driver by ID
    updateDriverById: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/driver/update-driver/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }, 'DriverList'],
    }),

  }),
});

// Export hooks
export const {
  useCreateDriverMutation,
  useGetAllDriversQuery,
  useGetDriverByIdQuery,
  useDeleteDriverByIdMutation,
  useUpdateDriverByIdMutation,
} = driverApi;
