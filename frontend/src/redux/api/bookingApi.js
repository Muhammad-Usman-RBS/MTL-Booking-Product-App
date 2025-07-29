import { apiSlice } from '../apiSlice';

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Booking
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: "/booking/create-booking",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Bookings"],
    }),

    // Fetch All Bookings by Company ID
    getAllBookings: builder.query({
      query: (companyId) => ({
        url: `/booking/get-booking?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: ["Bookings"],
    }),

    // Update Booking by ID
    updateBooking: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/booking/update-booking/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Bookings"],
    }),

    // Delete Booking by ID
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/delete-booking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),

    // Update Booking Status
    updateBookingStatus: builder.mutation({
      query: ({ id, status, updatedBy }) => ({
        url: `/booking/${id}`,
        method: "PATCH",
        body: { status, updatedBy },
      }),
    }),

    // GET ALL PASSENGERS
    getAllPassengers: builder.query({
      query: (companyId) => ({
        url: `/booking/get-all-passengers?companyId=${companyId}`,
        method: "GET",
      }),
    }),

    // Send Booking Data
    sendBookingEmail: builder.mutation({
      query: ({ bookingId, email }) => ({
        url: "/booking/send-booking-email",
        method: "POST",
        body: { bookingId, email },
      }),
    }),

    // Restore or Permanently Delete Booking
    restoreOrDeleteBooking: builder.mutation({
      query: ({ id, action, updatedBy }) => ({
        url: `/booking/restore-or-delete/${id}`,
        method: "PUT",
        body: { action, updatedBy },
      }),
      invalidatesTags: ["Bookings"],
    }),

  }),
});

export const {
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
  useGetAllPassengersQuery,
  useSendBookingEmailMutation,
  useRestoreOrDeleteBookingMutation,
} = bookingApi;
