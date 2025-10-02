import { apiSlice } from "../slices/apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ===== OTP FLOW (Create User -> Verification User) =====
    initiateUserVerification: builder.mutation({
      query: (payload) => ({ url: "/users/initiate-verification", method: "POST", body: payload }),
      // verification start pe koi list change nahi ho rahi
    }),
    verifyUserOtp: builder.mutation({
      query: ({ transactionId, otp }) => ({ url: "/users/verify-otp", method: "POST", body: { transactionId, otp } }),
      // verify ke baad actual user create hota hai -> lists ko refresh karo
      invalidatesTags: ["Users", "ClientAdmins", "Drivers", "Customers", "AssociateAdmins"],
    }),
    resendUserOtp: builder.mutation({
      query: ({ transactionId }) => ({ url: "/users/resend-otp", method: "POST", body: { transactionId } }),
    }),

    // ===== CLIENT ADMINS =====
    fetchClientAdmins: builder.query({
      query: () => ({ url: "/create-clientadmin", method: "GET" }),
      providesTags: ["ClientAdmins"],
    }),
    createClientAdmin: builder.mutation({
      query: (payload) => ({ url: "/create-clientadmin", method: "POST", body: payload }),
      invalidatesTags: ["ClientAdmins", "Users"],
    }),
    updateClientAdmin: builder.mutation({
      query: ({ adminId, payload }) => ({ url: `/create-clientadmin/${adminId}`, method: "PUT", body: payload }),
      invalidatesTags: ["ClientAdmins", "Users"],
    }),
    deleteClientAdmin: builder.mutation({
      query: (adminId) => ({ url: `/create-clientadmin/${adminId}`, method: "DELETE" }),
      invalidatesTags: ["ClientAdmins", "Users"],
    }),
    updateClientAdminStatus: builder.mutation({
      query: ({ adminId, newStatus }) => ({ url: `/create-clientadmin/${adminId}`, method: "PUT", body: { status: newStatus } }),
      invalidatesTags: ["ClientAdmins", "Users"],
    }),

    // ===== ASSOCIATE ADMINS =====
    fetchAssociateAdmins: builder.query({
      query: ({ createdBy, companyId }) => {
        const q = new URLSearchParams();
        if (createdBy) q.set("createdBy", createdBy);
        if (companyId) q.set("companyId", companyId);
        return { url: `/admins/associates?${q.toString()}`, method: "GET" };
      },
      providesTags: ["AssociateAdmins"],
    }),

    // ===== ALL USERS =====
    getAllUsers: builder.query({
      query: () => ({ url: "get-All-Users", method: "GET" }),
      providesTags: ["Users"],
    }),

    // ===== DRIVERS =====
    adminGetAllDrivers: builder.query({
      query: () => ({ url: "/get-all-drivers", method: "GET" }),
      providesTags: ["Drivers"],
    }),

    // ===== CUSTOMERS =====
    getAllCustomers: builder.query({
      query: () => ({ url: "/get-all-customers", method: "GET" }),
      providesTags: ["Customers"],
    }),

    // ===== PUBLIC: CREATE CUSTOMER VIA WIDGET =====
    createCustomerViaWidget: builder.mutation({
      query: (payload) => ({ url: "/create-customer", method: "POST", body: payload }),
      invalidatesTags: ["Customers", "Users"],
    }),

    updateBookingPreferences: builder.mutation({
      query: (preferences) => ({
        url: "/preferences",
        method: "PATCH",
        body: preferences,
      }),
      invalidatesTags: ["User"],
    }),
    getBookingPreferences: builder.query({
      query: () => ({
        url: "/preferences",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  // OTP
  useInitiateUserVerificationMutation,
  useVerifyUserOtpMutation,
  useResendUserOtpMutation,

  // Client Admins
  useFetchClientAdminsQuery,
  useCreateClientAdminMutation,
  useUpdateClientAdminMutation,
  useDeleteClientAdminMutation,
  useUpdateClientAdminStatusMutation,

  // Associate Admins
  useFetchAssociateAdminsQuery,

  // Users
  useGetAllUsersQuery,

  // Drivers
  useAdminGetAllDriversQuery,

  // Customers
  useGetAllCustomersQuery,
  useCreateCustomerViaWidgetMutation,
  useUpdateBookingPreferencesMutation,
  useGetBookingPreferencesQuery,
} = adminApi;
