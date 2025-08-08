import { apiSlice } from '../slices/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
        credentials: 'include', // for withCredentials: true
      }),
    }),

    // Forgot Password
    sendForgotPasswordOtp: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: '/auth/new-password',
        method: 'POST',
        body: { email, otp, newPassword },
      }),
    }),

    // Update Profile
    updateUserProfile: builder.mutation({
      query: (formData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    // Get Profile (optional)
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSendForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useUpdateUserProfileMutation,
  useGetProfileQuery,
} = userApi;
