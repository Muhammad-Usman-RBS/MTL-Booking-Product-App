import { apiSlice } from "../slices/apiSlice";

export const bookingSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Get Booking Settings
    getBookingSetting: builder.query({
      query: () => ({
        url: `/booking-settings/get-booking-setting`,
        method: "GET",
      }),
      providesTags: ['BookingSetting'],
    }),

    // Update Booking Settings
    updateBookingSetting: builder.mutation({
      query: (formData) => ({
        url: `/booking-settings/update-booking-setting`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['BookingSetting'],
    }),

  }),
});

export const {
  useGetBookingSettingQuery,
  useUpdateBookingSettingMutation,
} = bookingSettingsApi;
