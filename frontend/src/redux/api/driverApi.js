import { apiSlice } from "../apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDriver: builder.mutation({
      query: (formData) => ({
        url: "/driver/create-driver",
        method: "POST",
        body: formData,
      }),
    }),

    getAllDrivers: builder.query({
      query: () => ({
        url: "/driver/get-all-drivers",
      }),
    }),

    getDriverById: builder.query({
      query: (id) => ({
        url: `/driver/getDriverById/${id}`,
      }),
    }),

    deleteDriverById: builder.mutation({
      query: (id) => ({
        url: `/driver/delete-driver/${id}`,
        method: "DELETE",
      }),
    }),

    updateDriverById: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/driver/update-driver/${id}`,
        method: "PUT",
        body: formData,
      }),
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
