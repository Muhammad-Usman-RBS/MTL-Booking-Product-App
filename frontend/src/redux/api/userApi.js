import { apiSlice } from "../slices/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔐 Login (cookies auto-set)
    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
        credentials: "include", // ✅ send & receive cookies
      }),
      invalidatesTags: ["User"],
    }),
    // NEW: Verify login OTP for 2FA
    verifyLoginOtp: builder.mutation({
      query: ({ userId, otp }) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: { userId, otp }, 
      }),
    }),
    resendLoginOtp: builder.mutation({
      query: ({ userId }) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: { userId }, 
      }),
    }),
    // 📧 Forgot Password (OTP Send)
    sendForgotPasswordOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    // 🔑 Reset Password with OTP
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "/auth/new-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),

    // 👤 Update Profile
    updateUserProfile: builder.mutation({
      query: (formData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: formData,
        formData: true,
        credentials: "include", // ✅ user must be logged in
      }),
      invalidatesTags: ["User"],
    }),

    // 🏢 Get Superadmin Info (public)
    getSuperadminInfo: builder.query({
      query: () => ({
        url: "/auth/superadmin-info",
        method: "GET",
      }),
    }),

    // 👤 Get Current Logged-in User (for page refresh)
    getCurrentUser: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
        credentials: "include", // ✅ read from cookie
      }),
      providesTags: ["User"],
    }),

    // 🚪 Logout User
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include", // ✅ cookie clear
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useSendForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useUpdateUserProfileMutation,
  useGetSuperadminInfoQuery,
  useGetCurrentUserQuery,
  useLogoutUserMutation,
  useVerifyLoginOtpMutation,
  useResendLoginOtpMutation,
} = userApi;
