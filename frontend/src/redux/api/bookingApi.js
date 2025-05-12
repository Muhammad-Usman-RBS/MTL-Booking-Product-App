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

        // Get All Bookings
        getAllBookings: builder.query({
            query: () => ({
                url: "/booking/get-booking",
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
    }),
});

export const {
    useCreateBookingMutation,
    useGetAllBookingsQuery,
    useUpdateBookingMutation,
    useDeleteBookingMutation,
} = bookingApi;
