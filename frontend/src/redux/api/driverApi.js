import { apiSlice } from "../apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    createDriver: builder.mutation({
      query: (formData) => ({
        url: "/driver/create-driver",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['DriverList'],
    }),

    getAllDrivers: builder.query({
      query: () => ({
        url: "/driver/get-all-drivers",
      }),
      providesTags: ['DriverList'],
    }),

    getDriverById: builder.query({
      query: (id) => ({
        url: `/driver/getDriverById/${id}`, // ✅ fixed
      }),
      providesTags: (result, error, id) => [{ type: 'Driver', id }],
    }),

    deleteDriverById: builder.mutation({
      query: (id) => ({
        url: `/driver/delete-driver/${id}`, // ✅ fixed
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => ['DriverList', { type: 'Driver', id }],
    }),

    updateDriverById: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/driver/update-driver/${id}`, // ✅ fixed
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Driver', id }, 'DriverList'],
    }),

  }),
});

export const {
  useCreateDriverMutation,
  useGetAllDriversQuery,
  useGetDriverByIdQuery,
  useDeleteDriverByIdMutation,
  useUpdateDriverByIdMutation,
} = driverApi;
