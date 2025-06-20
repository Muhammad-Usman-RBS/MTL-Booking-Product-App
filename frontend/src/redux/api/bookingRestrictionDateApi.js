import { apiSlice } from "../apiSlice";

export const bookingRestrictionDateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBookingRestriction: builder.mutation({
      query: (payload) => ({
        url: "/settings/create-booking-registration",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BookingRestriction"],
    }),

    getAllBookingRestrictions: builder.query({
      query: (companyId) => ({
        url: `/settings/get-all-booking-registration?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: ["BookingRestriction"],
    }),

    getBookingRestrictionById: builder.query({
      query: (id) => ({
        url: `/settings/get-booking-registration/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "BookingRestriction", id }],
    }),

    updateBookingRestriction: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/settings/update-booking-registration/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["BookingRestriction"],
    }),

    deleteBookingRestriction: builder.mutation({
      query: (id) => ({
        url: `/settings/delete-booking-registration/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BookingRestriction"],
    }),
  }),
  tagTypes: ["BookingRestriction"],
});

export const {
  useCreateBookingRestrictionMutation,
  useGetAllBookingRestrictionsQuery,
  useGetBookingRestrictionByIdQuery,
  useUpdateBookingRestrictionMutation,
  useDeleteBookingRestrictionMutation,
} = bookingRestrictionDateApi;
