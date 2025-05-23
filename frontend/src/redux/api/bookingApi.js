import { apiSlice } from '../apiSlice';

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create Booking
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: "/booking/create-booking",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ Submit Booking via Widget
    submitWidgetForm: builder.mutation({
      query: (payload) => ({
        url: "/booking/submit",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ Fetch All Bookings by Company ID
    getAllBookings: builder.query({
      query: (companyId) => ({
        url: `/booking/get-booking?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: ["Bookings"],
    }),

    // ✅ Update Booking by ID
    updateBooking: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/booking/update-booking/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ Delete Booking by ID
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/delete-booking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),

    // ✅ Update Booking Status
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/booking/${id}`,
        method: "PATCH",
        body: { status },
      }),
    }),

  }),
});

export const {
  useCreateBookingMutation,
  useSubmitWidgetFormMutation,
  useGetAllBookingsQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingApi;
